package org.opendatadiscovery.oddplatform.repository;

import com.fasterxml.jackson.core.type.TypeReference;
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
import org.apache.commons.lang3.StringUtils;
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
import org.opendatadiscovery.oddplatform.dto.DataConsumerAttributes;
import org.opendatadiscovery.oddplatform.dto.DataEntityAttributes;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto.DataConsumerDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto.DataQualityTestDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityLineageDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityLineageStreamDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityType;
import org.opendatadiscovery.oddplatform.dto.DataInputAttributes;
import org.opendatadiscovery.oddplatform.dto.DataQualityTestAttributes;
import org.opendatadiscovery.oddplatform.dto.DataSetAttributes;
import org.opendatadiscovery.oddplatform.dto.DataTransformerAttributes;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.LineageDepth;
import org.opendatadiscovery.oddplatform.dto.LineageStreamKind;
import org.opendatadiscovery.oddplatform.dto.MetadataDto;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;
import org.opendatadiscovery.oddplatform.dto.SearchFilterId;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTypePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TypeEntityRelationPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.LineageRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import static java.util.Collections.emptyList;
import static java.util.Collections.emptyMap;
import static java.util.Collections.singletonList;
import static java.util.Objects.requireNonNull;
import static java.util.function.Function.identity;
import static java.util.function.Predicate.not;
import static org.jooq.impl.DSL.condition;
import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.jooq.impl.DSL.max;
import static org.jooq.impl.DSL.name;
import static org.jooq.impl.DSL.val;
import static org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto.DataInputDetailsDto;
import static org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto.DataSetDetailsDto;
import static org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto.DataTransformerDetailsDto;
import static org.opendatadiscovery.oddplatform.dto.LineageStreamKind.DOWNSTREAM;
import static org.opendatadiscovery.oddplatform.dto.LineageStreamKind.UPSTREAM;
import static org.opendatadiscovery.oddplatform.model.Tables.ALERT;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_VERSION;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_SUBTYPE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TYPE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL_TO_DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.LINEAGE;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD_VALUE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.TYPE_ENTITY_RELATION;
import static org.opendatadiscovery.oddplatform.model.Tables.TYPE_SUBTYPE_RELATION;

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
        FacetType.NAMESPACES, filters -> DATA_SOURCE.NAMESPACE_ID.in(extractFilterId(filters)),
        FacetType.SUBTYPES, filters -> DATA_ENTITY_SUBTYPE.ID.in(extractFilterId(filters)),
        FacetType.OWNERS, filters -> OWNER.ID.in(extractFilterId(filters)),
        FacetType.TAGS, filters -> TAG.ID.in(extractFilterId(filters))
    );

    public static final TypeReference<Map<String, ?>> SPECIFIC_ATTRIBUTES_TYPE_REFERENCE = new TypeReference<>() {
    };

    private final JooqFTSHelper jooqFTSHelper;
    private final JooqRecordHelper jooqRecordHelper;
    private final TypeEntityRelationRepository typeEntityRelationRepository;
    private final DataEntityTaskRunRepository dataEntityTaskRunRepository;

    public DataEntityRepositoryImpl(final DSLContext dslContext,
                                    final JooqQueryHelper jooqQueryHelper,
                                    final JooqFTSHelper jooqFTSHelper,
                                    final JooqRecordHelper jooqRecordHelper,
                                    final TypeEntityRelationRepository typeEntityRelationRepository,
                                    final DataEntityTaskRunRepository dataEntityTaskRunRepository) {
        super(dslContext, jooqQueryHelper, DATA_ENTITY, DATA_ENTITY.ID, null, DataEntityDimensionsDto.class);

        this.jooqFTSHelper = jooqFTSHelper;
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

        if (StringUtils.isNotEmpty(state.getQuery())) {
            select = select.and(ftsCondition(state.getQuery()));
        }

        final Set<Long> dataSourceIds = state.getFacetEntitiesIds(FacetType.DATA_SOURCES);
        if (!dataSourceIds.isEmpty()) {
            select = select.join(DATA_SOURCE)
                .on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
                .and(DATA_SOURCE.ID.in(dataSourceIds));
        }

        return select
            .where(DATA_ENTITY_SUBTYPE.NAME.containsIgnoreCase(StringUtils.isNotEmpty(facetQuery) ? facetQuery : ""))
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

        if (StringUtils.isNotEmpty(state.getQuery())) {
            select = select.and(ftsCondition(state.getQuery()));
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
            .where(OWNER.NAME.containsIgnoreCase((StringUtils.isNotEmpty(facetQuery) ? facetQuery : "")))
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

        if (StringUtils.isNotEmpty(state.getQuery())) {
            select = select.and(ftsCondition(state.getQuery()));
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
            .where(TAG.NAME.containsIgnoreCase(StringUtils.isNotEmpty(facetQuery) ? facetQuery : ""))
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

        if (StringUtils.isNotEmpty(state.getQuery())) {
            select = select.and(ftsCondition(state.getQuery()));
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

        if (StringUtils.isNotEmpty(state.getQuery())) {
            query = query.and(ftsCondition(state.getQuery()));
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

        return enrichDataEntityDetailsDto(dataEntitySelect(config)
            .fetchStream()
            .map(this::mapDetailsRecord)
            .collect(Collectors.toList()));
    }

    @Override
    public List<DataEntityDimensionsDto> listAllByOddrns(final Collection<String> oddrns) {
        return listAllByOddrns(oddrns, null, null, false);
    }

    private List<DataEntityDimensionsDto> listAllByOddrns(final Collection<String> oddrns,
                                                          final Integer page,
                                                          final Integer size,
                                                          final boolean skipHollow) {
        final Set<String> conditionValues = CollectionUtils.emptyIfNull(oddrns)
            .stream()
            .map(String::toLowerCase)
            .collect(Collectors.toSet());

        if (conditionValues.isEmpty()) {
            return emptyList();
        }

        DataEntitySelectConfig.DataEntitySelectConfigBuilder configBuilder = DataEntitySelectConfig.builder()
            .cteSelectConditions(singletonList(DATA_ENTITY.ODDRN.in(conditionValues)))
            .includeHollow(!skipHollow);

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

        return listAllByOddrns(oddrns, page, size, true);
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
        final Pair<List<Condition>, List<Condition>> conditionsPair =
            resultFacetStateConditions(state, state.isMyObjects());

        final List<Condition> joinConditions = new ArrayList<>(conditionsPair.getRight());

        if (owner != null) {
            joinConditions.add(OWNER.ID.eq(owner.getId()));
        }

        DataEntitySelectConfig.DataEntitySelectConfigBuilder builder = DataEntitySelectConfig
            .builder()
            .cteSelectConditions(conditionsPair.getLeft())
            .joinSelectConditions(joinConditions);

        if (StringUtils.isNotEmpty(state.getQuery())) {
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
    @Transactional
    public void setDescription(final long dataEntityId, final String description) {
        dslContext.update(DATA_ENTITY)
            .set(DATA_ENTITY.INTERNAL_DESCRIPTION, description)
            .where(DATA_ENTITY.ID.eq(dataEntityId))
            .execute();

        calculateDataEntityVectors(List.of(dataEntityId));
    }

    @Override
    @Transactional
    public void setInternalName(final long dataEntityId, final String businessName) {
        final String newBusinessName = businessName != null && businessName.isEmpty() ? null : businessName;
        dslContext.update(DATA_ENTITY)
            .set(DATA_ENTITY.INTERNAL_NAME, newBusinessName)
            .where(DATA_ENTITY.ID.eq(dataEntityId))
            .execute();

        calculateDataEntityVectors(List.of(dataEntityId));
    }

    @Override
    @Transactional
    public void calculateSearchEntrypoints(final Collection<Long> dataEntityIds) {
        calculateDataEntityVectors(dataEntityIds);
        calculateDataSourceVectors(dataEntityIds);
        calculateNamespaceVectors(dataEntityIds);
        calculateMetadataVectors(dataEntityIds);
        calculateStructureVectors(dataEntityIds);
    }

    @Override
    public void calculateDataEntityVectors(final Collection<Long> dataEntityIds) {
        final Field<Long> dataEntityId = field("data_entity_id", Long.class);

        final List<Field<?>> vectorFields = List.of(
            DATA_ENTITY.EXTERNAL_NAME,
            DATA_ENTITY.INTERNAL_NAME,
            DATA_ENTITY.EXTERNAL_DESCRIPTION,
            DATA_ENTITY.INTERNAL_DESCRIPTION
        );

        final SelectConditionStep<Record> vectorSelect = dslContext
            .select(vectorFields)
            .select(DATA_ENTITY.ID.as(dataEntityId))
            .from(DATA_ENTITY)
            .where(DATA_ENTITY.ID.in(dataEntityIds))
            .and(DATA_ENTITY.HOLLOW.isFalse());

        jooqFTSHelper
            .buildSearchEntrypointUpsert(vectorSelect, dataEntityId, vectorFields, SEARCH_ENTRYPOINT.DATA_ENTITY_VECTOR)
            .execute();
    }

    @Override
    public void calculateTagVectors(final Collection<Long> dataEntityIds) {
        final Field<Long> dataEntityId = field("data_entity_id", Long.class);

        final List<Field<?>> vectorFields = List.of(TAG.NAME);

        final SelectConditionStep<Record> vectorSelect = dslContext.select(vectorFields)
            .select(DATA_ENTITY.ID.as(dataEntityId))
            .from(TAG)
            .join(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.TAG_ID.eq(TAG.ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .where(DATA_ENTITY.ID.in(dataEntityIds))
            .and(TAG.IS_DELETED.isFalse());

        jooqFTSHelper
            .buildSearchEntrypointUpsert(vectorSelect, dataEntityId, vectorFields, SEARCH_ENTRYPOINT.TAG_VECTOR, true)
            .execute();
    }

    @Override
    public void calculateNamespaceVectors(final Collection<Long> dataEntityIds) {
        final Field<Long> dataEntityId = field("data_entity_id", Long.class);

        final List<Field<?>> vectorFields = List.of(NAMESPACE.NAME);

        final SelectConditionStep<Record> vectorSelect = dslContext
            .select(DATA_ENTITY.ID.as(dataEntityId))
            .select(vectorFields)
            .from(NAMESPACE)
            .join(DATA_SOURCE).on(DATA_SOURCE.NAMESPACE_ID.eq(NAMESPACE.ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.DATA_SOURCE_ID.eq(DATA_SOURCE.ID)).and(DATA_ENTITY.HOLLOW.isFalse())
            .where(DATA_ENTITY.ID.in(dataEntityIds))
            .and(NAMESPACE.IS_DELETED.isFalse());

        jooqFTSHelper
            .buildSearchEntrypointUpsert(vectorSelect, dataEntityId, vectorFields, SEARCH_ENTRYPOINT.NAMESPACE_VECTOR)
            .execute();
    }

    @Override
    public void calculateDataSourceVectors(final Collection<Long> dataEntityIds) {
        final Field<Long> dataEntityId = field("data_entity_id", Long.class);

        final List<Field<?>> vectorFields = List.of(DATA_SOURCE.NAME, DATA_SOURCE.CONNECTION_URL, DATA_SOURCE.ODDRN);

        final SelectConditionStep<Record> vectorSelect = dslContext
            .select(DATA_ENTITY.ID.as(dataEntityId))
            .select(vectorFields)
            .from(DATA_SOURCE)
            .join(DATA_ENTITY).on(DATA_ENTITY.DATA_SOURCE_ID.eq(DATA_SOURCE.ID)).and(DATA_ENTITY.HOLLOW.isFalse())
            .where(DATA_ENTITY.ID.in(dataEntityIds))
            .and(DATA_SOURCE.IS_DELETED.isFalse());

        jooqFTSHelper
            .buildSearchEntrypointUpsert(vectorSelect, dataEntityId, vectorFields, SEARCH_ENTRYPOINT.DATA_SOURCE_VECTOR)
            .execute();
    }

    @Override
    public void calculateMetadataVectors(final Collection<Long> dataEntityIds) {
        final Field<Long> deId = field("data_entity_id", Long.class);

        final List<Field<?>> fields = List.of(
            METADATA_FIELD.NAME,
            METADATA_FIELD_VALUE.VALUE
        );

        final SelectConditionStep<Record> select = dslContext
            .select(DATA_ENTITY.ID.as(deId))
            .select(fields)
            .from(METADATA_FIELD)
            .join(METADATA_FIELD_VALUE).on(METADATA_FIELD_VALUE.METADATA_FIELD_ID.eq(METADATA_FIELD.ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(METADATA_FIELD_VALUE.DATA_ENTITY_ID))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .where(DATA_ENTITY.ID.in(dataEntityIds))
            .and(METADATA_FIELD.IS_DELETED.isFalse());

        jooqFTSHelper
            .buildSearchEntrypointUpsert(select, deId, fields, SEARCH_ENTRYPOINT.METADATA_VECTOR, true)
            .execute();
    }

    @Override
    public List<DataEntityDto> getQuerySuggestions(final String query) {
        if (StringUtils.isEmpty(query)) {
            return emptyList();
        }

        final Name deCteName = name(DATA_ENTITY_CTE_NAME);

        final Field<?> searchVectorAlias = field("sv_alias", Object.class);

        final Select<Record> dataEntitySelect = dslContext
            .select(DATA_ENTITY.fields())
            .select(SEARCH_ENTRYPOINT.SEARCH_VECTOR.as(searchVectorAlias))
            .from(SEARCH_ENTRYPOINT)
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
            .where(ftsCondition(query))
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
            .leftJoin(ALERT).on(ALERT.DATA_ENTITY_ODDRN.eq(deCte.field(DATA_ENTITY.ODDRN)))
            .groupBy(selectFields)
            .orderBy(
                ftsRanking(searchVectorAlias, query),
                deCte.field(DATA_ENTITY.INTERNAL_NAME),
                deCte.field(DATA_ENTITY.EXTERNAL_NAME)
            )
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

    private void calculateStructureVectors(final Collection<Long> dataEntityIds) {
        final String dsOddrnAlias = "dsv_dataset_oddrn";

        final Field<String> datasetOddrnField = DATASET_VERSION.DATASET_ODDRN.as(dsOddrnAlias);
        final Field<Long> dsvMaxField = max(DATASET_VERSION.VERSION).as("dsv_max");

        final SelectHavingStep<Record3<Long, String, Long>> subquery = dslContext
            .select(DATA_ENTITY.ID, datasetOddrnField, dsvMaxField)
            .from(DATASET_VERSION)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .where(DATA_ENTITY.ID.in(dataEntityIds))
            .groupBy(DATA_ENTITY.ID, DATASET_VERSION.DATASET_ODDRN);

        final Field<Long> deId = subquery.field(DATA_ENTITY.ID);

        final Field<String> labelName = LABEL.NAME.as("label_name");

        final List<Field<?>> vectorFields = List.of(
            DATASET_FIELD.NAME,
            DATASET_FIELD.INTERNAL_DESCRIPTION,
            DATASET_FIELD.EXTERNAL_DESCRIPTION,
            labelName
        );

        final SelectOnConditionStep<Record> vectorSelect = dslContext
            .select(vectorFields)
            .select(deId)
            .from(subquery)
            .join(DATASET_VERSION)
            .on(DATASET_VERSION.DATASET_ODDRN.eq(subquery.field(dsOddrnAlias, String.class)))
            .and(DATASET_VERSION.VERSION.eq(dsvMaxField))
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .join(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .leftJoin(LABEL_TO_DATASET_FIELD).on(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
            .leftJoin(LABEL).on(LABEL.ID.eq(LABEL_TO_DATASET_FIELD.LABEL_ID)).and(LABEL.IS_DELETED.isFalse());

        jooqFTSHelper.buildSearchEntrypointUpsert(
            vectorSelect,
            deId,
            vectorFields,
            SEARCH_ENTRYPOINT.STRUCTURE_VECTOR,
            true,
            Map.of(labelName, LABEL.NAME)
        ).execute();
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
            .selectDistinct(cte.field(LINEAGE.PARENT_ODDRN), cte.field(LINEAGE.CHILD_ODDRN))
            .from(cte.getName())
            .fetchStreamInto(LineagePojo.class)
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
        final Field<?> searchVectorAlias = field("sv_alias");
        final DataEntitySelectConfig.Fts ftsConfig = config.getFts();

        Select<Record> dataEntitySelect;

        if (ftsConfig != null) {
            dataEntitySelect = dslContext.select(DATA_ENTITY.fields())
                .select(SEARCH_ENTRYPOINT.SEARCH_VECTOR.as(searchVectorAlias))
                .from(SEARCH_ENTRYPOINT)
                .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
                .where(ListUtils.emptyIfNull(config.getCteSelectConditions()))
                .and(ftsCondition(ftsConfig.getQuery()));
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
            .leftJoin(NAMESPACE).on(DATA_SOURCE.NAMESPACE_ID.eq(NAMESPACE.ID))
            .leftJoin(OWNERSHIP).on(deCte.field(DATA_ENTITY.ID).eq(OWNERSHIP.DATA_ENTITY_ID))
            .leftJoin(OWNER).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .leftJoin(ROLE).on(OWNERSHIP.ROLE_ID.eq(ROLE.ID))
            .leftJoin(ALERT).on(ALERT.DATA_ENTITY_ODDRN.eq(deCte.field(DATA_ENTITY.ODDRN)));

        if (config.isIncludeDetails()) {
            joinStep = joinStep
                .leftJoin(DATASET_VERSION).on(deCte.field(DATA_ENTITY.ODDRN).eq(DATASET_VERSION.DATASET_ODDRN))
                .leftJoin(METADATA_FIELD_VALUE)
                .on(deCte.field(DATA_ENTITY.ID).eq(METADATA_FIELD_VALUE.DATA_ENTITY_ID))
                .leftJoin(METADATA_FIELD).on(METADATA_FIELD_VALUE.METADATA_FIELD_ID.eq(METADATA_FIELD.ID));
        }

        final SelectHavingStep<Record> groupByStep = joinStep
            .where(ListUtils.emptyIfNull(config.getJoinSelectConditions()))
            .groupBy(selectFields);

        return ftsConfig != null
            ? groupByStep.orderBy(ftsRanking(searchVectorAlias, ftsConfig.getQuery()))
            : groupByStep;
    }

    private DataEntityDetailsDto enrichDataEntityDetailsDto(final DataEntityDetailsDto detailsDto) {
        final Set<String> deps = detailsDto.getSpecificAttributes().values().stream()
            .map(DataEntityAttributes::getDependentOddrns)
            .flatMap(Set::stream)
            .collect(Collectors.toSet());

        final Map<String, DataEntityDimensionsDto> depsRepository = listAllByOddrns(deps)
            .stream()
            .collect(Collectors.toMap(dto -> dto.getDataEntity().getOddrn(), identity()));

        enrichDataEntityDetailsDto(detailsDto, depsRepository);

        return detailsDto;
    }

    private List<DataEntityDetailsDto> enrichDataEntityDetailsDto(final List<DataEntityDetailsDto> detailsDtos) {
        final Set<String> deps = detailsDtos.stream().map(DataEntityDto::getSpecificAttributes)
            .map(Map::values)
            .flatMap(Collection::stream)
            .map(DataEntityAttributes::getDependentOddrns)
            .flatMap(Set::stream)
            .collect(Collectors.toSet());

        final Map<String, DataEntityDimensionsDto> depsRepository = listAllByOddrns(deps)
            .stream()
            .collect(Collectors.toMap(dto -> dto.getDataEntity().getOddrn(), identity()));

        for (final DataEntityDetailsDto detailsDto : detailsDtos) {
            enrichDataEntityDetailsDto(detailsDto, depsRepository);
        }

        return detailsDtos;
    }

    private void enrichDataEntityDetailsDto(final DataEntityDetailsDto dto,
                                            final Map<String, DataEntityDimensionsDto> depsRepository) {
        final Function<Collection<String>, Collection<? extends DataEntityDto>> fetcher = oddrns -> oddrns.stream()
            .map(String::toLowerCase)
            .map(depsRepository::get)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        dto.getSpecificAttributes().forEach((t, attrs) -> {
            switch (t) {
                case DATA_SET:
                    final DataSetAttributes dsa = (DataSetAttributes) attrs;

                    final DataSetDetailsDto dataSetDetailsDto = dto.getDataSetDetailsDto() != null
                        ? dto.getDataSetDetailsDto()
                        : new DataSetDetailsDto();

                    dataSetDetailsDto.setRowsCount(dsa.getRowsCount());
                    dataSetDetailsDto.setFieldsCount(dsa.getFieldsCount());
                    dataSetDetailsDto.setConsumersCount(dsa.getConsumersCount());

                    dto.setDataSetDetailsDto(dataSetDetailsDto);

                    break;
                case DATA_TRANSFORMER:
                    final DataTransformerAttributes dta = (DataTransformerAttributes) attrs;

                    dto.setDataTransformerDetailsDto(DataTransformerDetailsDto.builder()
                        .sourceList(fetcher.apply(dta.getSourceOddrnList()))
                        .targetList(fetcher.apply(dta.getTargetOddrnList()))
                        .sourceCodeUrl(dta.getSourceCodeUrl())
                        .build());

                    break;
                case DATA_QUALITY_TEST:
                    final DataQualityTestAttributes dqta = (DataQualityTestAttributes) attrs;

                    dto.setDataQualityTestDetailsDto(DataQualityTestDetailsDto.builder()
                        .suiteName(dqta.getSuiteName())
                        .suiteUrl(dqta.getSuiteUrl())
                        .datasetList(fetcher.apply(dqta.getDatasetOddrnList()))
                        .linkedUrlList(dqta.getLinkedUrlList())
                        .latestTaskRun(dataEntityTaskRunRepository
                            .getLatestRun(dto.getDataEntity().getOddrn())
                            .orElse(null))
                        .expectationType(dqta.getExpectation().getType())
                        .expectationParameters(dqta.getExpectation().getAdditionalProperties())
                        .build());
                    break;
                case DATA_CONSUMER:
                    final DataConsumerAttributes dca = (DataConsumerAttributes) attrs;

                    dto.setDataConsumerDetailsDto(DataConsumerDetailsDto.builder()
                        .inputList(fetcher.apply(dca.getInputListOddrn()))
                        .build());
                    break;

                case DATA_INPUT:
                    final DataInputAttributes dia = (DataInputAttributes) attrs;

                    dto.setDataInputDetailsDto(DataInputDetailsDto.builder()
                        .outputList(fetcher.apply(dia.getOutputListOddrn()))
                        .build());
                    break;
                default:
                    break;
            }
        });
    }

    private DataEntityDto mapDtoRecord(final Record r) {
        final Record deRecord = jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY);
        final DataEntityPojo dataEntity = jooqRecordHelper.extractRelation(deRecord, DATA_ENTITY, DataEntityPojo.class);

        final Set<DataEntityTypePojo> types =
            jooqRecordHelper.extractAggRelation(r, AGG_TYPES_FIELD, DataEntityTypePojo.class);

        return DataEntityDto.builder()
            .dataEntity(dataEntity)
            .hasAlerts(!jooqRecordHelper.extractAggRelation(r, AGG_ALERT_FIELD, AlertPojo.class).isEmpty())
            .subtype(jooqRecordHelper.extractRelation(r, DATA_ENTITY_SUBTYPE, DataEntitySubtypePojo.class))
            .specificAttributes(extractSpecificAttributes(dataEntity, types))
            .types(types)
            .build();
    }

    private DataEntityDimensionsDto mapDimensionRecord(final Record r) {
        final Record deRecord = jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY);
        final DataEntityPojo dataEntity = jooqRecordHelper.extractRelation(deRecord, DATA_ENTITY, DataEntityPojo.class);

        final Set<DataEntityTypePojo> types =
            jooqRecordHelper.extractAggRelation(r, AGG_TYPES_FIELD, DataEntityTypePojo.class);

        return DataEntityDimensionsDto.dimensionsBuilder()
            .dataEntity(dataEntity)
            .hasAlerts(!jooqRecordHelper.extractAggRelation(r, AGG_ALERT_FIELD, AlertPojo.class).isEmpty())
            .dataSource(jooqRecordHelper.extractRelation(r, DATA_SOURCE, DataSourcePojo.class))
            .subtype(jooqRecordHelper.extractRelation(r, DATA_ENTITY_SUBTYPE, DataEntitySubtypePojo.class))
            .specificAttributes(extractSpecificAttributes(dataEntity, types))
            .namespace(jooqRecordHelper.extractRelation(r, NAMESPACE, NamespacePojo.class))
            .ownership(extractOwnershipRelation(r))
            .types(types)
            .tags(jooqRecordHelper.extractAggRelation(r, AGG_TAGS_FIELD, TagPojo.class))
            .build();
    }

    private DataEntityDetailsDto mapDetailsRecord(final Record r) {
        final Record deRecord = jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY);
        final DataEntityPojo dataEntity = jooqRecordHelper.extractRelation(deRecord, DATA_ENTITY, DataEntityPojo.class);

        final Set<DataEntityTypePojo> types =
            jooqRecordHelper.extractAggRelation(r, AGG_TYPES_FIELD, DataEntityTypePojo.class);

        // ad-hoc solution until https://github.com/opendatadiscovery/odd-platform/issues/123 is fixed
        final Set<DatasetVersionPojo> datasetVersions = jooqRecordHelper
            .extractAggRelation(r, AGG_DSV_FIELD, DatasetVersionPojo.class)
            .stream()
            .sorted((d1, d2) -> d2.getVersion().compareTo(d1.getVersion()))
            .collect(Collectors.toCollection(LinkedHashSet::new));

        return DataEntityDetailsDto.detailsBuilder()
            .dataEntity(dataEntity)
            .hasAlerts(!jooqRecordHelper.extractAggRelation(r, AGG_ALERT_FIELD, AlertPojo.class).isEmpty())
            .dataSource(jooqRecordHelper.extractRelation(r, DATA_SOURCE, DataSourcePojo.class))
            .subtype(jooqRecordHelper.extractRelation(r, DATA_ENTITY_SUBTYPE, DataEntitySubtypePojo.class))
            .specificAttributes(extractSpecificAttributes(dataEntity, types))
            .namespace(jooqRecordHelper.extractRelation(r, NAMESPACE, NamespacePojo.class))
            .ownership(extractOwnershipRelation(r))
            .types(types)
            .tags(jooqRecordHelper.extractAggRelation(r, AGG_TAGS_FIELD, TagPojo.class))
            .dataSetDetailsDto(DataSetDetailsDto.builder()
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
                    throw new IllegalArgumentException(String.format(
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
                    throw new IllegalArgumentException(
                        String.format("There's no owner with id %s found in ownerDict", os.getOwnerId()));
                }

                final RolePojo role = roleDict.get(os.getRoleId());
                if (role == null) {
                    throw new IllegalArgumentException(
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

    private Map<DataEntityType, DataEntityAttributes> extractSpecificAttributes(
        final DataEntityPojo dataEntity,
        final Collection<DataEntityTypePojo> types) {
        if (dataEntity.getHollow()) {
            return emptyMap();
        }

        final Map<String, ?> specificAttributes = JSONSerDeUtils.deserializeJson(
            dataEntity.getSpecificAttributes().data(),
            SPECIFIC_ATTRIBUTES_TYPE_REFERENCE
        );

        return types
            .stream()
            .map(DataEntityTypePojo::getName)
            .map(DataEntityType::valueOf)
            .map(t -> Pair.of(t, JSONSerDeUtils.deserializeJson(
                specificAttributes.get(t.toString()),
                DataEntityAttributes.TYPE_TO_ATTR_CLASS.get(t)
            )))
            .filter(p -> p.getRight() != null)
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));
    }

    private static List<Long> extractFilterId(final List<SearchFilterDto> filters) {
        return filters.stream()
            .map(SearchFilterDto::getEntityId)
            .collect(Collectors.toList());
    }

    private Condition ftsCondition(final String query) {
        final Field<Object> conditionField = field(
            "? @@ plainto_tsquery(?)",
            SEARCH_ENTRYPOINT.SEARCH_VECTOR,
            String.format("%s:*", query)
        );

        return condition(conditionField.toString());
    }

    private OrderField<Object> ftsRanking(final Field<?> vectorField, final String query) {
        requireNonNull(vectorField);

        return field(
            "ts_rank_cd(?, plainto_tsquery(?))",
            vectorField,
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
