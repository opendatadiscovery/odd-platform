package com.provectus.oddplatform.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.provectus.oddplatform.dto.DataEntityDetailsDto;
import com.provectus.oddplatform.dto.DataEntityDetailsDto.DataQualityTestAttributes;
import com.provectus.oddplatform.dto.DataEntityDetailsDto.DataQualityTestDetailsDto;
import com.provectus.oddplatform.dto.DataEntityDetailsDto.DataTransformerAttributes;
import com.provectus.oddplatform.dto.DataEntityDimensionsDto;
import com.provectus.oddplatform.dto.DataEntityDto;
import com.provectus.oddplatform.dto.DataEntityLineageDto;
import com.provectus.oddplatform.dto.DataEntityLineageStreamDto;
import com.provectus.oddplatform.dto.DataEntityType;
import com.provectus.oddplatform.dto.FacetStateDto;
import com.provectus.oddplatform.dto.FacetType;
import com.provectus.oddplatform.dto.LineageDepth;
import com.provectus.oddplatform.dto.LineageStreamKind;
import com.provectus.oddplatform.dto.MetadataDto;
import com.provectus.oddplatform.dto.OwnershipDto;
import com.provectus.oddplatform.dto.SearchFilterDto;
import com.provectus.oddplatform.dto.SearchFilterId;
import com.provectus.oddplatform.model.tables.pojos.AlertPojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTypePojo;
import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetVersionPojo;
import com.provectus.oddplatform.model.tables.pojos.LineagePojo;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import com.provectus.oddplatform.model.tables.pojos.OwnershipPojo;
import com.provectus.oddplatform.model.tables.pojos.RolePojo;
import com.provectus.oddplatform.model.tables.pojos.TagPojo;
import com.provectus.oddplatform.model.tables.pojos.TypeEntityRelationPojo;
import com.provectus.oddplatform.model.tables.records.DataEntityRecord;
import com.provectus.oddplatform.model.tables.records.LineageRecord;
import com.provectus.oddplatform.model.tables.records.SearchEntrypointRecord;
import com.provectus.oddplatform.repository.util.JooqFTSVectorizer;
import com.provectus.oddplatform.repository.util.JooqRecordHelper;
import com.provectus.oddplatform.utils.JSONSerDeUtils;
import com.provectus.oddplatform.utils.Page;
import com.provectus.oddplatform.utils.Pair;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.ListUtils;
import org.jooq.CommonTableExpression;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.InsertValuesStep2;
import org.jooq.Name;
import org.jooq.OrderField;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Record3;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SelectHavingStep;
import org.jooq.SelectLimitStep;
import org.jooq.SelectOnConditionStep;
import org.jooq.SelectSelectStep;
import org.jooq.SortField;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.TableField;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import static com.provectus.oddplatform.dto.LineageStreamKind.DOWNSTREAM;
import static com.provectus.oddplatform.dto.LineageStreamKind.UPSTREAM;
import static com.provectus.oddplatform.model.Tables.ALERT;
import static com.provectus.oddplatform.model.Tables.DATASET_VERSION;
import static com.provectus.oddplatform.model.Tables.DATA_ENTITY;
import static com.provectus.oddplatform.model.Tables.DATA_ENTITY_SUBTYPE;
import static com.provectus.oddplatform.model.Tables.DATA_ENTITY_TYPE;
import static com.provectus.oddplatform.model.Tables.DATA_SOURCE;
import static com.provectus.oddplatform.model.Tables.LINEAGE;
import static com.provectus.oddplatform.model.Tables.METADATA_FIELD;
import static com.provectus.oddplatform.model.Tables.METADATA_FIELD_VALUE;
import static com.provectus.oddplatform.model.Tables.NAMESPACE;
import static com.provectus.oddplatform.model.Tables.OWNER;
import static com.provectus.oddplatform.model.Tables.OWNERSHIP;
import static com.provectus.oddplatform.model.Tables.ROLE;
import static com.provectus.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static com.provectus.oddplatform.model.Tables.TAG;
import static com.provectus.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;
import static com.provectus.oddplatform.model.Tables.TYPE_ENTITY_RELATION;
import static com.provectus.oddplatform.model.Tables.TYPE_SUBTYPE_RELATION;
import static java.util.Collections.emptyList;
import static java.util.Collections.singletonList;
import static java.util.Objects.requireNonNull;
import static java.util.function.Function.identity;
import static java.util.function.Predicate.not;
import static org.jooq.impl.DSL.condition;
import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.jooq.impl.DSL.name;
import static org.jooq.impl.DSL.val;

@Repository
@Slf4j
public class DataEntityRepositoryImpl
    extends AbstractCRUDRepository<DataEntityRecord, DataEntityDimensionsDto>
    implements DataEntityRepository {

    private static final int SUGGESTION_LIMIT = 5;

    private static final String DATA_ENTITY_CTE_NAME = "dataEntityCTE";

    private static final String AGG_TYPES_FIELD = "type";
    private static final String AGG_TAGS_FIELD = "tag";
    private static final String AGG_DSV_FIELD = "dataset_version";
    private static final String AGG_MF_FIELD = "metadata_field";
    private static final String AGG_MFV_FIELD = "metadata_field_value";
    private static final String AGG_OWNERSHIP_FIELD = "ownership";
    private static final String AGG_OWNER_FIELD = "owner";
    private static final String AGG_ROLE_FIELD = "role";
    private static final String AGG_ALERT_FIELD = "alert";

    private static final Collector<Record3<Long, String, Integer>, ?, Map<SearchFilterId, Long>> FACET_COLLECTOR
        = Collectors.toMap(
        r -> SearchFilterId.builder().entityId(r.component1()).name(r.component2()).build(),
        r -> r.component3().longValue()
    );

    private static final Map<FacetType, Function<List<SearchFilterDto>, Condition>> CONDITIONS = Map.of(
        FacetType.TYPES, filters -> DATA_ENTITY_TYPE.ID.in(extractFilterId(filters)),
        FacetType.DATA_SOURCES, filters -> DATA_ENTITY.DATA_SOURCE_ID.in(extractFilterId(filters))
    );

    private static final Map<FacetType, Function<List<SearchFilterDto>, Condition>> EXTENDED_CONDITIONS = Map.of(
        FacetType.TYPES, filters -> DATA_ENTITY_TYPE.ID.in(extractFilterId(filters)),
        FacetType.DATA_SOURCES, filters -> DATA_ENTITY.DATA_SOURCE_ID.in(extractFilterId(filters)),
        FacetType.SUBTYPES, filters -> DATA_ENTITY_SUBTYPE.ID.in(extractFilterId(filters)),
        FacetType.OWNERS, filters -> OWNER.ID.in(extractFilterId(filters)),
        FacetType.TAGS, filters -> TAG.ID.in(extractFilterId(filters))
    );

    private final JooqFTSVectorizer vectorizer;
    private final JooqRecordHelper jooqRecordHelper;
    private final TypeEntityRelationRepository typeEntityRelationRepository;
    private final DataEntityTaskRunRepository dataEntityTaskRunRepository;

    public DataEntityRepositoryImpl(final DSLContext dslContext,
                                    final JooqFTSVectorizer vectorizer,
                                    final JooqRecordHelper jooqRecordHelper,
                                    final TypeEntityRelationRepository typeEntityRelationRepository,
                                    final DataEntityTaskRunRepository dataEntityTaskRunRepository) {
        super(dslContext, DATA_ENTITY, DATA_ENTITY.ID, null, DataEntityDimensionsDto.class);

        this.vectorizer = vectorizer;
        this.jooqRecordHelper = jooqRecordHelper;
        this.typeEntityRelationRepository = typeEntityRelationRepository;
        this.dataEntityTaskRunRepository = dataEntityTaskRunRepository;
    }

    @Override
    public Optional<DataEntityDimensionsDto> get(final long id) {
        final DataEntitySelectConfig config = DataEntitySelectConfig.builder()
            .cteSelectConditions(singletonList(DATA_ENTITY.ID.eq(id)))
            .build();

        return dataEntitySelect(config).fetchOptional(this::mapDimensionRecord);
    }

    @Override
    @Transactional
    public List<DataEntityDto> bulkCreate(final List<DataEntityDto> dtos) {
        if (dtos.isEmpty()) {
            return List.of();
        }

        final Map<String, DataEntityDto> dtoDict = dtos.stream()
            .collect(Collectors.toMap(d -> d.getDataEntity().getOddrn(), identity()));

        final List<DataEntityPojo> createdDataEntities = bulkInsert(
            dtos.stream().map(DataEntityDto::getDataEntity).collect(Collectors.toList()),
            DataEntityPojo.class
        );

        final List<TypeEntityRelationPojo> typeRelations = createdDataEntities.stream()
            .flatMap(pojo -> dtoDict.get(pojo.getOddrn())
                .getTypes()
                .stream()
                .map(t -> new TypeEntityRelationPojo()
                    .setDataEntityId(pojo.getId())
                    .setDataEntityTypeId(t.getId())))
            .collect(Collectors.toList());

        typeEntityRelationRepository.bulkCreate(typeRelations);

        return createdDataEntities
            .stream()
            .map(p -> {
                final DataEntityDto dto = dtoDict.get(p.getOddrn());

                return DataEntityDto.builder()
                    .dataEntity(dto.getDataEntity().setId(p.getId()))
                    .types(dto.getTypes())
                    .build();
            })
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<DataEntityDto> bulkUpdate(final List<DataEntityDto> dtos) {
        final List<DataEntityRecord> records = dtos.stream()
            .map(DataEntityDto::getDataEntity)
            .map(e -> dslContext.newRecord(recordTable, e))
            .peek(r -> {
                r.changed(DATA_ENTITY.INTERNAL_DESCRIPTION, false);
                r.changed(DATA_ENTITY.INTERNAL_NAME, false);
                r.changed(DATA_ENTITY.NAMESPACE_ID, false);
                r.changed(DATA_ENTITY.VIEW_COUNT, false);
            })
            .collect(Collectors.toList());

        final List<TypeEntityRelationPojo> typeRelations = dtos
            .stream()
            .flatMap(d -> d.getTypes().stream().map(
                t -> new TypeEntityRelationPojo()
                    .setDataEntityId(d.getDataEntity().getId())
                    .setDataEntityTypeId(t.getId())
            ))
            .collect(Collectors.toList());

        typeEntityRelationRepository.bulkCreate(typeRelations);

        dslContext.batchUpdate(records).execute();

        return dtos;
    }

    @Override
    public Optional<Long> incrementViewCount(final long id) {
        return dslContext.update(DATA_ENTITY)
            .set(DATA_ENTITY.VIEW_COUNT, DATA_ENTITY.VIEW_COUNT.plus(1))
            .where(DATA_ENTITY.ID.eq(id))
            .returningResult(DATA_ENTITY.VIEW_COUNT)
            .fetchOptional()
            .map(Record1::value1);
    }

    @Override
    public void createHollow(final Collection<String> oddrns) {
        InsertValuesStep2<DataEntityRecord, String, Boolean> step
            = dslContext.insertInto(DATA_ENTITY, DATA_ENTITY.ODDRN, DATA_ENTITY.HOLLOW);

        for (final String oddrn : oddrns) {
            step = step.values(oddrn, true);
        }

        step.onDuplicateKeyIgnore().execute();
    }

    @Override
    public Page<DataEntityDimensionsDto> list(final int page, final int size, final String query) {
        return Page.<DataEntityDimensionsDto>builder()
            .hasNext(false)
            .total(fetchCount(query))
            .data(listByConfig(DataEntitySelectConfig.emptyConfig()))
            .build();
    }

    @Override
    public Map<SearchFilterId, Long> getSubtypeFacet(final String facetQuery,
                                                     final int page,
                                                     final int size,
                                                     final FacetStateDto state) {
        final Long selectedType = state.selectedDataEntityType().orElse(null);

        if (selectedType == null) {
            return Map.of();
        }

        var select = dslContext.select(
            DATA_ENTITY_SUBTYPE.ID,
            DATA_ENTITY_SUBTYPE.NAME,
            countDistinct(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
            .from(DATA_ENTITY_SUBTYPE)
            .leftJoin(DATA_ENTITY)
            .on(DATA_ENTITY.SUBTYPE_ID.eq(DATA_ENTITY_SUBTYPE.ID))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .join(TYPE_SUBTYPE_RELATION).on(TYPE_SUBTYPE_RELATION.SUBTYPE_ID.eq(DATA_ENTITY_SUBTYPE.ID))
            .leftJoin(SEARCH_ENTRYPOINT)
            .on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID));

        if (StringUtils.hasLength(state.getQuery())) {
            select = select.and(ftsCondition(SEARCH_ENTRYPOINT.DATA_ENTITY_VECTOR, state));
        }

        final Set<Long> dataSourceIds = state.getFacetEntitiesIds(FacetType.DATA_SOURCES);
        if (!dataSourceIds.isEmpty()) {
            select = select.join(DATA_SOURCE)
                .on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
                .and(DATA_SOURCE.ID.in(dataSourceIds));
        }

        return select
            .where(DATA_ENTITY_SUBTYPE.NAME.containsIgnoreCase(StringUtils.hasLength(facetQuery) ? facetQuery : ""))
            .and(TYPE_SUBTYPE_RELATION.TYPE_ID.eq(selectedType))
            .groupBy(DATA_ENTITY_SUBTYPE.ID, DATA_ENTITY_SUBTYPE.NAME)
            .orderBy(countDistinct(SEARCH_ENTRYPOINT.DATA_ENTITY_ID).desc())
            .limit(size)
            .offset((page - 1) * size)
            .fetchStream()
            .collect(FACET_COLLECTOR);
    }

    @Override
    public Map<SearchFilterId, Long> getOwnerFacet(final String facetQuery,
                                                   final int page,
                                                   final int size,
                                                   final FacetStateDto state) {
        var select = dslContext.select(OWNER.ID, OWNER.NAME, countDistinct(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
            .from(OWNER)
            .leftJoin(OWNERSHIP).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .leftJoin(SEARCH_ENTRYPOINT).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(OWNERSHIP.DATA_ENTITY_ID));

        if (StringUtils.hasLength(state.getQuery())) {
            select = select.and(ftsCondition(SEARCH_ENTRYPOINT.DATA_ENTITY_VECTOR, state));
        }

        select = select
            .leftJoin(DATA_ENTITY)
            .on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .and(DATA_ENTITY.HOLLOW.isFalse());

        final Long selectedType = state.selectedDataEntityType().orElse(null);

        if (selectedType != null) {
            select = select
                .leftJoin(TYPE_ENTITY_RELATION).on(TYPE_ENTITY_RELATION.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
                .leftJoin(DATA_ENTITY_TYPE)
                .on(DATA_ENTITY_TYPE.ID.eq(TYPE_ENTITY_RELATION.DATA_ENTITY_TYPE_ID))
                .and(DATA_ENTITY_TYPE.ID.eq(selectedType));
        }

        final Set<Long> dataSourceIds = state.getFacetEntitiesIds(FacetType.DATA_SOURCES);
        if (!dataSourceIds.isEmpty()) {
            select = select.join(DATA_SOURCE)
                .on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
                .and(DATA_SOURCE.ID.in(dataSourceIds));
        }

        return select
            .where(OWNER.NAME.containsIgnoreCase((StringUtils.hasLength(facetQuery) ? facetQuery : "")))
            .and(OWNER.IS_DELETED.isFalse())
            .groupBy(OWNER.ID, OWNER.NAME)
            .orderBy(countDistinct(SEARCH_ENTRYPOINT.DATA_ENTITY_ID).desc())
            .limit(size)
            .offset((page - 1) * size)
            .fetchStream()
            .collect(FACET_COLLECTOR);
    }

    @Override
    public Map<SearchFilterId, Long> getTagFacet(final String facetQuery,
                                                 final int page,
                                                 final int size,
                                                 final FacetStateDto state) {
        var select = dslContext.select(TAG.ID, TAG.NAME, countDistinct(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
            .from(TAG)
            .leftJoin(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.TAG_ID.eq(TAG.ID))
            .leftJoin(SEARCH_ENTRYPOINT).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID));

        if (StringUtils.hasLength(state.getQuery())) {
            select = select.and(ftsCondition(SEARCH_ENTRYPOINT.DATA_ENTITY_VECTOR, state));
        }

        select = select
            .leftJoin(DATA_ENTITY)
            .on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .and(DATA_ENTITY.HOLLOW.isFalse());

        final Long selectedType = state.selectedDataEntityType().orElse(null);

        if (selectedType != null) {
            select = select
                .leftJoin(TYPE_ENTITY_RELATION).on(TYPE_ENTITY_RELATION.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
                .leftJoin(DATA_ENTITY_TYPE)
                .on(DATA_ENTITY_TYPE.ID.eq(TYPE_ENTITY_RELATION.DATA_ENTITY_TYPE_ID))
                .and(DATA_ENTITY_TYPE.ID.eq(selectedType));
        }

        final Set<Long> dataSourceIds = state.getFacetEntitiesIds(FacetType.DATA_SOURCES);
        if (!dataSourceIds.isEmpty()) {
            select = select.join(DATA_SOURCE)
                .on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
                .and(DATA_SOURCE.ID.in(dataSourceIds));
        }

        return select
            .where(TAG.NAME.containsIgnoreCase(StringUtils.hasLength(facetQuery) ? facetQuery : ""))
            .and(TAG.IS_DELETED.isFalse())
            .groupBy(TAG.ID, TAG.NAME)
            .orderBy(countDistinct(SEARCH_ENTRYPOINT.DATA_ENTITY_ID).desc())
            .limit(size)
            .offset((page - 1) * size)
            .fetchStream()
            .collect(FACET_COLLECTOR);
    }

    @Override
    public Map<SearchFilterId, Long> getTypeFacet(final FacetStateDto state) {
        var select = dslContext.select(DATA_ENTITY_TYPE.ID, DATA_ENTITY_TYPE.NAME, countDistinct(DATA_ENTITY.ID))
            .from(TYPE_ENTITY_RELATION)
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(TYPE_ENTITY_RELATION.DATA_ENTITY_ID))
            .join(SEARCH_ENTRYPOINT).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(DATA_ENTITY_TYPE).on(TYPE_ENTITY_RELATION.DATA_ENTITY_TYPE_ID.eq(DATA_ENTITY_TYPE.ID))
            .leftJoin(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(TAG).on(TAG_TO_DATA_ENTITY.TAG_ID.eq(TAG.ID))
            .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(OWNER).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .join(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
            .join(DATA_ENTITY_SUBTYPE).on(DATA_ENTITY_SUBTYPE.ID.eq(DATA_ENTITY.SUBTYPE_ID))
            .where(facetStateConditions(state, true, true))
            .and(DATA_ENTITY.HOLLOW.isFalse());

        if (StringUtils.hasLength(state.getQuery())) {
            select = select.and(ftsCondition(SEARCH_ENTRYPOINT.DATA_ENTITY_VECTOR, state));
        }

        return select
            .groupBy(DATA_ENTITY_TYPE.ID, DATA_ENTITY_TYPE.NAME)
            .fetchStream()
            .collect(FACET_COLLECTOR);
    }

    @Override
    public Long countByState(final FacetStateDto state) {
        return countByState(state, null);
    }

    @Override
    public Long countByState(final FacetStateDto state, final OwnerPojo owner) {
        SelectConditionStep<Record1<Integer>> query = dslContext.select(countDistinct(DATA_ENTITY.ID))
            .from(DATA_ENTITY)
            .join(SEARCH_ENTRYPOINT).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(TAG).on(TAG_TO_DATA_ENTITY.TAG_ID.eq(TAG.ID))
            .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(OWNER).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .join(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
            .join(DATA_ENTITY_SUBTYPE).on(DATA_ENTITY_SUBTYPE.ID.eq(DATA_ENTITY.SUBTYPE_ID))
            .where(facetStateConditions(state, true, true))
            .and(DATA_ENTITY.HOLLOW.isFalse());

        if (StringUtils.hasLength(state.getQuery())) {
            query = query.and(ftsCondition(SEARCH_ENTRYPOINT.DATA_ENTITY_VECTOR, state));
        }

        if (owner != null) {
            query = query.and(OWNER.ID.eq(owner.getId()));
        }

        return query.fetchOneInto(Long.class);
    }

    @Override
    public Collection<DataEntityDimensionsDto> listByOddrns(final Collection<String> oddrns) {
        return listByConfig(DataEntitySelectConfig.builder()
            .cteSelectConditions(singletonList(DATA_ENTITY.ODDRN.in(CollectionUtils.emptyIfNull(oddrns))))
            .build());
    }

    @Override
    public Collection<DataEntityDetailsDto> listDetailsByOddrns(final Collection<String> oddrns) {
        final DataEntitySelectConfig config = DataEntitySelectConfig.builder()
            .cteSelectConditions(singletonList(DATA_ENTITY.ODDRN.in(CollectionUtils.emptyIfNull(oddrns))))
            .includeDetails(true)
            .build();

        return dataEntitySelect(config)
            .fetchStream()
            .map(this::mapDetailsRecord)
            // TODO: Fix N + 1
            .map(this::enrichDataEntityDetailsDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<DataEntityDimensionsDto> listAllByOddrns(final Collection<String> oddrns) {
        return listAllByOddrns(oddrns, null, null);
    }

    private List<DataEntityDimensionsDto> listAllByOddrns(final Collection<String> oddrns,
                                                          final Integer page,
                                                          final Integer size) {
        DataEntitySelectConfig.DataEntitySelectConfigBuilder configBuilder = DataEntitySelectConfig.builder()
            .cteSelectConditions(singletonList(DATA_ENTITY.ODDRN.in(CollectionUtils.emptyIfNull(oddrns))))
            .includeHollow(true);

        if (page != null && size != null) {
            configBuilder = configBuilder.cteLimitOffset(
                new DataEntitySelectConfig.LimitOffset(size, (page - 1) * size));
        }

        return listByConfig(configBuilder.build());
    }

    @Override
    public List<DataEntityDimensionsDto> listByType(final int page,
                                                    final int size,
                                                    final long typeId,
                                                    final Long subTypeId) {
        DataEntitySelectConfig.DataEntitySelectConfigBuilder configBuilder = DataEntitySelectConfig
            .builder()
            .joinSelectConditions(singletonList(TYPE_ENTITY_RELATION.DATA_ENTITY_TYPE_ID.eq(typeId)))
            .cteLimitOffset(new DataEntitySelectConfig.LimitOffset(size, (page - 1) * size));

        if (subTypeId != null) {
            configBuilder =
                configBuilder.cteSelectConditions(singletonList(DATA_ENTITY.SUBTYPE_ID.eq(subTypeId)));
        }

        return listByConfig(configBuilder.build());
    }

    @Override
    public List<DataEntityDto> listByOwner(final int page, final int size, final long ownerId) {
        final DataEntitySelectConfig config = DataEntitySelectConfig.builder()
            .joinSelectConditions(singletonList(OWNERSHIP.OWNER_ID.eq(ownerId)))
            .build();

        return dataEntitySelect(config)
            .limit(size)
            .offset((page - 1) * size)
            .fetchStream()
            .map(this::mapDimensionRecord)
            .collect(Collectors.toList());
    }

    @Override
    public List<? extends DataEntityDto> listByOwner(final int page,
                                                     final int size,
                                                     final long ownerId,
                                                     final LineageStreamKind streamKind) {
        final DataEntitySelectConfig config = DataEntitySelectConfig.builder()
            .joinSelectConditions(singletonList(OWNERSHIP.OWNER_ID.eq(ownerId)))
            .build();

        final Set<String> associatedOddrns = dataEntitySelect(config)
            .fetchStream()
            .map(r -> jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY).get(DATA_ENTITY.ODDRN))
            .collect(Collectors.toSet());

        final List<String> oddrns = collectLineage(lineageCte(associatedOddrns, LineageDepth.empty(), streamKind))
            .stream()
            .flatMap(lp -> Stream.of(lp.getParentOddrn(), lp.getChildOddrn()))
            .distinct()
            .filter(not(associatedOddrns::contains))
            .collect(Collectors.toList());

        return listAllByOddrns(oddrns, page, size);
    }

    @Override
    public List<? extends DataEntityDto> listPopular(final int page, final int size) {
        final DataEntitySelectConfig config = DataEntitySelectConfig.builder()
            .cteLimitOffset(new DataEntitySelectConfig.LimitOffset(size, (page - 1) * size))
            .orderBy(DATA_ENTITY.VIEW_COUNT.sort(SortOrder.DESC))
            .build();

        return listByConfig(config);
    }

    @Override
    public Optional<DataEntityDetailsDto> getDetails(final long id) {
        final DataEntitySelectConfig config = DataEntitySelectConfig.builder()
            .cteSelectConditions(singletonList(DATA_ENTITY.ID.eq(id)))
            .includeDetails(true)
            .build();

        return dataEntitySelect(config)
            .fetchOptional(this::mapDetailsRecord)
            .map(this::enrichDataEntityDetailsDto);
    }

    @Override
    public Page<DataEntityDimensionsDto> findByState(final FacetStateDto state,
                                                     final int page,
                                                     final int size) {
        return findByState(state, page, size, null);
    }

    @Override
    public Page<DataEntityDimensionsDto> findByState(final FacetStateDto state,
                                                     final int page,
                                                     final int size,
                                                     final OwnerPojo owner) {
        final Pair<List<Condition>, List<Condition>> conditionsPair = resultFacetStateConditions(
            state, state.isMyObjects());

        final List<Condition> joinConditions = new ArrayList<>(conditionsPair.getRight());

        if (owner != null) {
            joinConditions.add(OWNER.ID.eq(owner.getId()));
        }

        DataEntitySelectConfig.DataEntitySelectConfigBuilder builder = DataEntitySelectConfig
            .builder()
            .cteSelectConditions(conditionsPair.getLeft())
            .joinSelectConditions(joinConditions);

        if (StringUtils.hasLength(state.getQuery())) {
            builder = builder.fts(
                new DataEntitySelectConfig.Fts(SEARCH_ENTRYPOINT.DATA_ENTITY_VECTOR, state.getQuery()));
        }

        final SelectLimitStep<Record> baseQuery = dataEntitySelect(builder.build());

        final Long total = fetchCount(baseQuery);

        final List<DataEntityDimensionsDto> entities = baseQuery
            .offset((page - 1) * size)
            .limit(size)
            .fetchStream()
            .map(this::mapDimensionRecord)
            .collect(Collectors.toList());

        return Page.<DataEntityDimensionsDto>builder()
            .data(entities)
            .hasNext(true)
            .total(total)
            .build();
    }

    @Override
    public void setDescription(final long dataEntityId, final String description) {
        dslContext.update(DATA_ENTITY)
            .set(DATA_ENTITY.INTERNAL_DESCRIPTION, description)
            .where(DATA_ENTITY.ID.eq(dataEntityId))
            .execute();
    }

    @Override
    public void setInternalName(final long dataEntityId, final String businessName) {
        dslContext.update(DATA_ENTITY)
            .set(DATA_ENTITY.INTERNAL_NAME, businessName)
            .where(DATA_ENTITY.ID.eq(dataEntityId))
            .execute();
    }

    @Override
    public void calculateSearchEntrypoints(final Collection<Long> newDataEntitiesIds,
                                           final Collection<Long> updatedDataEntitiesIds) {
        final List<Long> allEntitiesIds = Stream
            .concat(updatedDataEntitiesIds.stream(), newDataEntitiesIds.stream())
            .collect(Collectors.toList());

        final DataEntitySelectConfig config = DataEntitySelectConfig.builder()
            .cteSelectConditions(singletonList(DATA_ENTITY.ID.in(allEntitiesIds)))
            .includeDetails(true)
            .build();

        final Map<Long, DataEntityDetailsDto> dataMap = dataEntitySelect(config)
            .fetchStream()
            .map(this::mapDetailsRecord)
            // TODO: fix N + 1
            .map(this::enrichDataEntityDetailsDto)
            .collect(Collectors.toMap(dto -> dto.getDataEntity().getId(), identity()));

        final Set<Long> seSet = dslContext.select(SEARCH_ENTRYPOINT.DATA_ENTITY_ID)
            .from(SEARCH_ENTRYPOINT)
            .where(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.in(allEntitiesIds))
            .fetchStream()
            .map(Record1::component1)
            .collect(Collectors.toSet());

        dslContext.batchUpdate(allEntitiesIds
            .stream()
            .filter(seSet::contains)
            .map(dataMap::get)
            .filter(Objects::nonNull)
            .map(dto -> new SearchEntrypointRecord()
                .setDataEntityId(dto.getDataEntity().getId())
                .setDataEntityVector(vectorizer.toTsVector(dataMap.get(dto.getDataEntity().getId()))))
            .collect(Collectors.toList())).execute();

        dslContext.batchInsert(allEntitiesIds
            .stream()
            .filter(not(seSet::contains))
            .map(dataMap::get)
            .filter(Objects::nonNull)
            .map(dto -> new SearchEntrypointRecord()
                .setDataEntityId(dto.getDataEntity().getId())
                .setDataEntityVector(vectorizer.toTsVector(dataMap.get(dto.getDataEntity().getId()))))
            .collect(Collectors.toList())).execute();
    }

    @Override
    public void recalculateSearchEntrypoints(final long dataEntityId) {
        final DataEntitySelectConfig config = DataEntitySelectConfig.builder()
            .cteSelectConditions(singletonList(DATA_ENTITY.ID.eq(dataEntityId)))
            .includeDetails(true)
            .build();

        dataEntitySelect(config)
            .fetchOptional(this::mapDetailsRecord)
            .map(this::enrichDataEntityDetailsDto)
            .map(vectorizer::toTsVector)
            .ifPresent(tsvector -> dslContext.selectFrom(SEARCH_ENTRYPOINT)
                .where(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(dataEntityId))
                .fetchOptional()
                .map(r -> r.setDataEntityVector(tsvector))
                .map(dslContext::executeUpdate)
                .orElseGet(() -> {
                    log.info("There's no search entrypoint for {} data entity", dataEntityId);
                    return 0;
                }));
    }

    @Override
    public List<DataEntityDto> getQuerySuggestions(final String query) {
        final Name deCteName = name(DATA_ENTITY_CTE_NAME);

        final Select<Record> dataEntitySelect = dslContext
            .select(DATA_ENTITY.fields())
            .select(SEARCH_ENTRYPOINT.DATA_ENTITY_VECTOR)
            .from(SEARCH_ENTRYPOINT)
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
            .where(ftsCondition(SEARCH_ENTRYPOINT.DATA_ENTITY_VECTOR, query))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .limit(SUGGESTION_LIMIT);

        final Table<Record> deCte = dataEntitySelect.asTable(deCteName);

        final List<Field<?>> selectFields = Stream
            .of(
                deCte.fields(),
                DATA_ENTITY_SUBTYPE.fields()
            )
            .flatMap(Arrays::stream)
            .collect(Collectors.toList());

        return dslContext.with(deCteName)
            .asMaterialized(dataEntitySelect)
            .select(selectFields)
            .select(jsonArrayAgg(field(DATA_ENTITY_TYPE.asterisk().toString())).as(AGG_TYPES_FIELD))
            .select(jsonArrayAgg(field(ALERT.asterisk().toString())).as(AGG_ALERT_FIELD))
            .from(deCteName)
            .join(TYPE_ENTITY_RELATION).on(deCte.field(DATA_ENTITY.ID).eq(TYPE_ENTITY_RELATION.DATA_ENTITY_ID))
            .join(DATA_ENTITY_TYPE).on(TYPE_ENTITY_RELATION.DATA_ENTITY_TYPE_ID.eq(DATA_ENTITY_TYPE.ID))
            .join(DATA_ENTITY_SUBTYPE).on(deCte.field(DATA_ENTITY.SUBTYPE_ID).eq(DATA_ENTITY_SUBTYPE.ID))
            .leftJoin(ALERT).on(ALERT.DATA_ENTITY_ID.eq(deCte.field(DATA_ENTITY.ID)))
            .groupBy(selectFields)
            .orderBy(ftsRanking(deCte.field(SEARCH_ENTRYPOINT.DATA_ENTITY_VECTOR), query))
            .fetchStream()
            .map(this::mapDtoRecord)
            .collect(Collectors.toList());
    }

    @Override
    public Optional<DataEntityLineageDto> getLineage(final long dataEntityId,
                                                     final int lineageDepth,
                                                     final LineageStreamKind streamKind) {
        return get(dataEntityId).map(dto -> getLineage(lineageDepth, dto, streamKind));
    }

    private DataEntityLineageDto getLineage(final int lineageDepth,
                                            final DataEntityDimensionsDto dto,
                                            final LineageStreamKind streamKind) {
        final List<LineagePojo> downstreamRelations =
            streamKind.equals(DOWNSTREAM) || streamKind.equals(LineageStreamKind.FULL_GRAPH)
                ? collectLineage(lineageCte(dto.getDataEntity().getOddrn(), LineageDepth.of(lineageDepth), DOWNSTREAM))
                : emptyList();

        final List<LineagePojo> upstreamRelations =
            streamKind.equals(UPSTREAM) || streamKind.equals(LineageStreamKind.FULL_GRAPH)
                ? collectLineage(lineageCte(dto.getDataEntity().getOddrn(), LineageDepth.of(lineageDepth), UPSTREAM))
                : emptyList();

        final Set<String> oddrnsToFetch = Stream.concat(
            downstreamRelations.stream().flatMap(r -> Stream.of(r.getParentOddrn(), r.getChildOddrn())),
            upstreamRelations.stream().flatMap(r -> Stream.of(r.getParentOddrn(), r.getChildOddrn()))
        ).collect(Collectors.toSet());

        final Map<String, DataEntityDimensionsDto> dtoDict = listAllByOddrns(oddrnsToFetch)
            .stream()
            .collect(Collectors.toMap(d -> d.getDataEntity().getOddrn(), identity()));

        return DataEntityLineageDto.builder()
            .dataEntityDto(dto)
            .upstream(getLineageStream(dtoDict, upstreamRelations))
            .downstream(getLineageStream(dtoDict, downstreamRelations))
            .build();
    }

    private DataEntityLineageStreamDto getLineageStream(final Map<String, DataEntityDimensionsDto> dtoDict,
                                                        final List<LineagePojo> relations) {
        final List<Pair<Long, Long>> edges = relations.stream()
            .map(r -> Pair.of(
                dtoDict.get(r.getParentOddrn()).getDataEntity().getId(),
                dtoDict.get(r.getChildOddrn()).getDataEntity().getId()
            ))
            .collect(Collectors.toList());

        final List<DataEntityDimensionsDto> nodes = relations.stream()
            .flatMap(r -> Stream.of(r.getParentOddrn(), r.getChildOddrn()))
            .distinct()
            .map(dtoDict::get)
            .collect(Collectors.toList());

        return DataEntityLineageStreamDto.builder()
            .edges(edges)
            .nodes(nodes)
            .build();
    }

    private CommonTableExpression<Record> lineageCte(final Collection<String> oddrns,
                                                     final LineageDepth lineageDepth,
                                                     final LineageStreamKind streamKind) {
        final Name cteName = name("t");
        final Field<Integer> startDepth = val(1).as(field("depth", Integer.class));
        final Field<Integer> tDepth = field("t.depth", Integer.class);
        final Field<String> tChildOddrn = field("t.child_oddrn", String.class);
        final Field<String> tParentOddrn = field("t.parent_oddrn", String.class);

        final Pair<TableField<LineageRecord, String>, Field<String>> conditions =
            streamKind.equals(LineageStreamKind.DOWNSTREAM)
                ? Pair.of(LINEAGE.PARENT_ODDRN, tChildOddrn)
                : Pair.of(LINEAGE.CHILD_ODDRN, tParentOddrn);

        return cteName.as(dslContext
            .select(LINEAGE.asterisk())
            .select(startDepth)
            .from(LINEAGE)
            .where(conditions.getLeft().in(oddrns))
            .unionAll(
                dslContext
                    .select(LINEAGE.asterisk())
                    .select(tDepth.add(1))
                    .from(LINEAGE)
                    .join(cteName).on(conditions.getLeft().eq(conditions.getRight()))
                    .where(tDepth.lessThan(lineageDepth.getDepth()))
            ));
    }

    private CommonTableExpression<Record> lineageCte(final String oddrn,
                                                     final LineageDepth lineageDepth,
                                                     final LineageStreamKind streamKind) {
        return lineageCte(List.of(oddrn), lineageDepth, streamKind);
    }

    private List<LineagePojo> collectLineage(final CommonTableExpression<Record> cte) {
        return dslContext.withRecursive(cte)
            .select()
            .from(cte.getName())
            .fetchStreamInto(LineagePojo.class)
            // TODO: ad-hoc. Implement distinct in recursive CTE
            .distinct()
            .collect(Collectors.toList());
    }

    private List<DataEntityDimensionsDto> listByConfig(final DataEntitySelectConfig config) {
        return dataEntitySelect(config)
            .fetchStream()
            .map(this::mapDimensionRecord)
            .collect(Collectors.toList());
    }

    @SuppressWarnings("ConstantConditions")
    private SelectLimitStep<Record> dataEntitySelect(final DataEntitySelectConfig config) {
        final Name deCteName = name(DATA_ENTITY_CTE_NAME);
        final DataEntitySelectConfig.Fts ftsConfig = config.getFts();

        Select<Record> dataEntitySelect;

        if (ftsConfig != null) {
            dataEntitySelect = dslContext.select(DATA_ENTITY.fields())
                .select(SEARCH_ENTRYPOINT.DATA_ENTITY_VECTOR)
                .from(SEARCH_ENTRYPOINT)
                .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
                .where(ftsCondition(ftsConfig.getVectorField(), ftsConfig.getQuery()));
        } else {
            dataEntitySelect = dslContext.select(DATA_ENTITY.fields())
                .from(DATA_ENTITY)
                .where(ListUtils.emptyIfNull(config.getCteSelectConditions()));
        }

        if (config.getOrderBy() != null) {
            dataEntitySelect = ((SelectConditionStep<Record>) dataEntitySelect)
                .orderBy(config.getOrderBy());
        }

        if (!config.isIncludeHollow()) {
            dataEntitySelect = ((SelectConditionStep<Record>) dataEntitySelect)
                .and(DATA_ENTITY.HOLLOW.isFalse());
        }

        if (config.getCteLimitOffset() != null) {
            dataEntitySelect = ((SelectConditionStep<Record>) dataEntitySelect)
                .limit(config.getCteLimitOffset().getLimit())
                .offset(config.getCteLimitOffset().getOffset());
        }

        final Table<Record> deCte = dataEntitySelect.asTable(deCteName);

        final List<Field<?>> selectFields = Stream
            .of(
                deCte.fields(),
                NAMESPACE.fields(),
                DATA_SOURCE.fields(),
                DATA_ENTITY_SUBTYPE.fields()
            )
            .flatMap(Arrays::stream)
            .collect(Collectors.toList());

        SelectSelectStep<Record> selectStep = dslContext.with(deCteName)
            .asMaterialized(dataEntitySelect)
            .select(selectFields)
            .select(jsonArrayAgg(field(DATA_ENTITY_TYPE.asterisk().toString())).as(AGG_TYPES_FIELD))
            .select(jsonArrayAgg(field(TAG.asterisk().toString())).as(AGG_TAGS_FIELD))
            .select(jsonArrayAgg(field(OWNER.asterisk().toString())).as(AGG_OWNER_FIELD))
            .select(jsonArrayAgg(field(ROLE.asterisk().toString())).as(AGG_ROLE_FIELD))
            .select(jsonArrayAgg(field(OWNERSHIP.asterisk().toString())).as(AGG_OWNERSHIP_FIELD))
            .select(jsonArrayAgg(field(ALERT.asterisk().toString())).as(AGG_ALERT_FIELD));

        if (config.isIncludeDetails()) {
            selectStep = selectStep
                .select(jsonArrayAgg(field(DATASET_VERSION.asterisk().toString())).as(AGG_DSV_FIELD))
                .select(jsonArrayAgg(field(METADATA_FIELD.asterisk().toString())).as(AGG_MF_FIELD))
                .select(jsonArrayAgg(field(METADATA_FIELD_VALUE.asterisk().toString())).as(AGG_MFV_FIELD));
        }

        SelectOnConditionStep<Record> joinStep = selectStep
            .from(deCteName)
            .leftJoin(TYPE_ENTITY_RELATION).on(deCte.field(DATA_ENTITY.ID).eq(TYPE_ENTITY_RELATION.DATA_ENTITY_ID))
            .leftJoin(DATA_ENTITY_TYPE).on(TYPE_ENTITY_RELATION.DATA_ENTITY_TYPE_ID.eq(DATA_ENTITY_TYPE.ID))
            .leftJoin(DATA_ENTITY_SUBTYPE).on(deCte.field(DATA_ENTITY.SUBTYPE_ID).eq(DATA_ENTITY_SUBTYPE.ID))
            .leftJoin(TAG_TO_DATA_ENTITY).on(deCte.field(DATA_ENTITY.ID).eq(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID))
            .leftJoin(TAG).on(TAG_TO_DATA_ENTITY.TAG_ID.eq(TAG.ID))
            .leftJoin(DATA_SOURCE).on(deCte.field(DATA_ENTITY.DATA_SOURCE_ID).eq(DATA_SOURCE.ID))
            .leftJoin(NAMESPACE).on(deCte.field(DATA_ENTITY.NAMESPACE_ID).eq(NAMESPACE.ID))
            .leftJoin(OWNERSHIP).on(deCte.field(DATA_ENTITY.ID).eq(OWNERSHIP.DATA_ENTITY_ID))
            .leftJoin(OWNER).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .leftJoin(ROLE).on(OWNERSHIP.ROLE_ID.eq(ROLE.ID))
            .leftJoin(ALERT).on(ALERT.DATA_ENTITY_ID.eq(deCte.field(DATA_ENTITY.ID)));

        if (config.isIncludeDetails()) {
            joinStep = joinStep
                .leftJoin(DATASET_VERSION).on(deCte.field(DATA_ENTITY.ID).eq(DATASET_VERSION.DATASET_ID))
                .leftJoin(METADATA_FIELD_VALUE)
                .on(deCte.field(DATA_ENTITY.ID).eq(METADATA_FIELD_VALUE.DATA_ENTITY_ID))
                .leftJoin(METADATA_FIELD).on(METADATA_FIELD_VALUE.METADATA_FIELD_ID.eq(METADATA_FIELD.ID));
        }

        final SelectHavingStep<Record> groupByStep = joinStep
            .where(ListUtils.emptyIfNull(config.getJoinSelectConditions()))
            .groupBy(selectFields);

        return ftsConfig != null
            ? groupByStep.orderBy(ftsRanking(deCte.field(ftsConfig.getVectorField()), ftsConfig.getQuery()))
            : groupByStep;
    }

    private DataEntityDetailsDto enrichDataEntityDetailsDto(final DataEntityDetailsDto detailsDto) {
        final Set<DataEntityType> dtoTypes = detailsDto.getTypes()
            .stream()
            .map(DataEntityTypePojo::getName)
            .map(DataEntityType::valueOf)
            .collect(Collectors.toSet());

        final Map<String, ?> specificAttributes = JSONSerDeUtils.deserializeJson(
            detailsDto.getDataEntity().getSpecificAttributes().data(),
            new TypeReference<Map<String, ?>>() {
            }
        );

        if (dtoTypes.contains(DataEntityType.DATA_TRANSFORMER)) {
            final DataTransformerAttributes attrs = JSONSerDeUtils.deserializeJson(
                specificAttributes.get(DataEntityType.DATA_TRANSFORMER.toString()),
                DataTransformerAttributes.class
            );

            detailsDto.setDataTransformerDetailsDto(DataEntityDetailsDto.DataTransformerDetailsDto.builder()
                .sourceList(listAllByOddrns(attrs.getSourceOddrnList()))
                .targetList(listAllByOddrns(attrs.getTargetOddrnList()))
                .sourceCodeUrl(attrs.getSourceCodeUrl())
                .build());
        }

        if (dtoTypes.contains(DataEntityType.DATA_QUALITY_TEST)) {
            final DataQualityTestAttributes attrs = JSONSerDeUtils.deserializeJson(
                specificAttributes.get(DataEntityType.DATA_QUALITY_TEST.toString()),
                DataQualityTestAttributes.class
            );

            detailsDto.setDataQualityTestDetailsDto(DataQualityTestDetailsDto.builder()
                .suiteName(attrs.getSuiteName())
                .suiteUrl(attrs.getSuiteUrl())
                .datasetList(listAllByOddrns(attrs.getDatasetOddrnList()))
                .linkedUrlList(attrs.getLinkedUrlList())
                .latestTaskRun(dataEntityTaskRunRepository
                    .getLatestRun(detailsDto.getDataEntity().getOddrn())
                    .orElse(null))
                .expectationType(attrs.getExpectation().getType())
                .expectationParameters(attrs.getExpectation().getAdditionalProperties())
                .build());
        }

        return detailsDto;
    }

    private DataEntityDto mapDtoRecord(final Record r) {
        final Record deRecord = jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY);

        return DataEntityDto.builder()
            .dataEntity(jooqRecordHelper.extractRelation(deRecord, DATA_ENTITY, DataEntityPojo.class))
            .hasAlerts(!jooqRecordHelper.extractAggRelation(r, AGG_ALERT_FIELD, AlertPojo.class).isEmpty())
            .subtype(jooqRecordHelper.extractRelation(r, DATA_ENTITY_SUBTYPE, DataEntitySubtypePojo.class))
            .types(jooqRecordHelper.extractAggRelation(r, AGG_TYPES_FIELD, DataEntityTypePojo.class))
            .build();
    }

    private DataEntityDimensionsDto mapDimensionRecord(final Record r) {
        final Record deRecord = jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY);

        return DataEntityDimensionsDto.dimensionsBuilder()
            .dataEntity(jooqRecordHelper.extractRelation(deRecord, DATA_ENTITY, DataEntityPojo.class))
            .hasAlerts(!jooqRecordHelper.extractAggRelation(r, AGG_ALERT_FIELD, AlertPojo.class).isEmpty())
            .dataSource(jooqRecordHelper.extractRelation(r, DATA_SOURCE, DataSourcePojo.class))
            .subtype(jooqRecordHelper.extractRelation(r, DATA_ENTITY_SUBTYPE, DataEntitySubtypePojo.class))
            .namespace(jooqRecordHelper.extractRelation(r, NAMESPACE, NamespacePojo.class))
            .ownership(extractOwnershipRelation(r))
            .types(jooqRecordHelper.extractAggRelation(r, AGG_TYPES_FIELD, DataEntityTypePojo.class))
            .tags(jooqRecordHelper.extractAggRelation(r, AGG_TAGS_FIELD, TagPojo.class))
            .build();
    }

    private DataEntityDetailsDto mapDetailsRecord(final Record r) {
        final Record deRecord = jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY);

        // ad-hoc solution until https://github.com/opendatadiscovery/odd-platform/issues/123 is fixed
        final Set<DatasetVersionPojo> datasetVersions = jooqRecordHelper
            .extractAggRelation(r, AGG_DSV_FIELD, DatasetVersionPojo.class)
            .stream()
            .sorted((d1, d2) -> d2.getVersion().compareTo(d1.getVersion()))
            .collect(Collectors.toCollection(LinkedHashSet::new));

        return DataEntityDetailsDto.detailsBuilder()
            .dataEntity(jooqRecordHelper.extractRelation(deRecord, DATA_ENTITY, DataEntityPojo.class))
            .hasAlerts(!jooqRecordHelper.extractAggRelation(r, AGG_ALERT_FIELD, AlertPojo.class).isEmpty())
            .dataSource(jooqRecordHelper.extractRelation(r, DATA_SOURCE, DataSourcePojo.class))
            .subtype(jooqRecordHelper.extractRelation(r, DATA_ENTITY_SUBTYPE, DataEntitySubtypePojo.class))
            .namespace(jooqRecordHelper.extractRelation(r, NAMESPACE, NamespacePojo.class))
            .ownership(extractOwnershipRelation(r))
            .types(jooqRecordHelper.extractAggRelation(r, AGG_TYPES_FIELD, DataEntityTypePojo.class))
            .tags(jooqRecordHelper.extractAggRelation(r, AGG_TAGS_FIELD, TagPojo.class))
            .dataSetDetailsDto(DataEntityDetailsDto.DataSetDetailsDto.builder()
                .datasetVersions(datasetVersions)
                .build())
            .metadata(extractMetadataRelation(r))
            .build();
    }

    private List<MetadataDto> extractMetadataRelation(final Record r) {
        final Map<Long, MetadataFieldPojo> metadataFields = jooqRecordHelper
            .extractAggRelation(r, AGG_MF_FIELD, MetadataFieldPojo.class)
            .stream()
            .collect(Collectors.toMap(MetadataFieldPojo::getId, identity()));

        return jooqRecordHelper.extractAggRelation(r, AGG_MFV_FIELD, MetadataFieldValuePojo.class)
            .stream()
            .map(mfv -> {
                final MetadataFieldPojo metadataField = metadataFields.get(mfv.getMetadataFieldId());
                if (null == metadataField) {
                    throw new IllegalStateException(String.format(
                        "Corrupted metadata field value object -- no corresponding metadata field. MFV: %s",
                        mfv));
                }

                return MetadataDto.builder()
                    .metadataField(metadataField)
                    .metadataFieldValue(mfv)
                    .build();
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    private List<OwnershipDto> extractOwnershipRelation(final Record r) {
        final Map<Long, OwnerPojo> ownerDict = jooqRecordHelper.extractAggRelation(r, AGG_OWNER_FIELD, OwnerPojo.class)
            .stream()
            .collect(Collectors.toMap(OwnerPojo::getId, identity()));

        final Map<Long, RolePojo> roleDict = jooqRecordHelper.extractAggRelation(r, AGG_ROLE_FIELD, RolePojo.class)
            .stream()
            .collect(Collectors.toMap(RolePojo::getId, identity()));

        return jooqRecordHelper.extractAggRelation(r, AGG_OWNERSHIP_FIELD, OwnershipPojo.class)
            .stream()
            .map(os -> {
                final OwnerPojo owner = ownerDict.get(os.getOwnerId());
                if (owner == null) {
                    throw new IllegalStateException(
                        String.format("There's no owner with id %s found in ownerDict", os.getOwnerId()));
                }

                final RolePojo role = roleDict.get(os.getRoleId());
                if (role == null) {
                    throw new IllegalStateException(
                        String.format("There's no role with id %s found in roleDict", os.getRoleId()));
                }

                return OwnershipDto.builder()
                    .ownership(os)
                    .owner(owner)
                    .role(role)
                    .build();
            })
            .collect(Collectors.toList());
    }

    private static List<Long> extractFilterId(final List<SearchFilterDto> filters) {
        return filters.stream()
            .map(SearchFilterDto::getEntityId)
            .collect(Collectors.toList());
    }

    private Condition ftsCondition(final Field<?> vectorField, final FacetStateDto state) {
        return ftsCondition(vectorField, state.getQuery());
    }

    private Condition ftsCondition(final Field<?> vectorField, final String query) {
        final Field<Object> conditionField = field(
            "? @@ to_tsquery(?)",
            vectorField.getQualifiedName(),
            String.format("%s:*", query)
        );

        return condition(conditionField.toString());
    }

    private OrderField<Object> ftsRanking(final Field<?> vectorField, final String query) {
        requireNonNull(vectorField);

        return field(
            "ts_rank_cd(?, to_tsquery(?))",
            vectorField.getQualifiedName(),
            String.format("%s:*", query)
        ).desc();
    }

    private List<Condition> facetStateConditions(final FacetStateDto state,
                                                 final boolean extended,
                                                 final boolean skipTypeCondition) {
        return state.getState().entrySet().stream()
            .filter(e -> {
                if (skipTypeCondition) {
                    return !e.getKey().equals(FacetType.TYPES);
                }

                return true;
            })
            .map(e -> compileFacetCondition(e.getKey(), e.getValue(), extended))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    // TODO: ad-hoc
    private Pair<List<Condition>, List<Condition>> resultFacetStateConditions(final FacetStateDto state,
                                                                              final boolean skipTypeCondition) {
        final List<Condition> joinConditions = state.getState().entrySet().stream()
            .filter(e -> {
                if (skipTypeCondition) {
                    return !e.getKey().equals(FacetType.TYPES);
                }

                return true;
            })
            .filter(e -> !e.getKey().equals(FacetType.DATA_SOURCES))
            .map(e -> compileFacetCondition(e.getKey(), e.getValue(), true))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        final List<Condition> cteConditions = state.getState().entrySet().stream()
            .filter(e -> e.getKey().equals(FacetType.DATA_SOURCES))
            .map(e -> compileFacetCondition(e.getKey(), e.getValue(), true))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        return Pair.of(cteConditions, joinConditions);
    }

    private Condition compileFacetCondition(final FacetType facetType,
                                            final List<SearchFilterDto> filters,
                                            final boolean extended) {
        final Map<FacetType, Function<List<SearchFilterDto>, Condition>> conditionsDict = extended
            ? EXTENDED_CONDITIONS
            : CONDITIONS;

        final Function<List<SearchFilterDto>, Condition> function = conditionsDict.get(facetType);

        if (function == null || filters == null || filters.isEmpty()) {
            return null;
        }

        return function.apply(filters);
    }

    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Data
    private static class DataEntitySelectConfig {
        private List<Condition> cteSelectConditions;
        private LimitOffset cteLimitOffset;
        private List<Condition> joinSelectConditions;
        private boolean includeDetails;
        private boolean includeHollow;
        private SortField<?> orderBy;
        private Fts fts;

        @RequiredArgsConstructor
        @Data
        private static class LimitOffset {
            private final int limit;
            private final int offset;
        }

        @RequiredArgsConstructor
        @Data
        private static class Fts {
            private final Field<?> vectorField;
            private final String query;
        }

        public static DataEntitySelectConfig emptyConfig() {
            return new DataEntitySelectConfig();
        }
    }
}
