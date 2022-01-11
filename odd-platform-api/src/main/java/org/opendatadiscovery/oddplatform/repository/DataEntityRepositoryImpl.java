package org.opendatadiscovery.oddplatform.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.ListUtils;
import org.apache.commons.collections4.SetUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.jooq.CommonTableExpression;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Name;
import org.jooq.OrderField;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Record3;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SelectHavingStep;
import org.jooq.SelectJoinStep;
import org.jooq.SelectLimitStep;
import org.jooq.SelectOnConditionStep;
import org.jooq.SelectOrderByStep;
import org.jooq.SelectSelectStep;
import org.jooq.SortField;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.TableField;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto.DataConsumerDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto.DataQualityTestDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto.DataTransformerDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityGroupLineageDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityLineageDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityLineageStreamDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.LineageDepth;
import org.opendatadiscovery.oddplatform.dto.LineageStreamKind;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.dto.attributes.DataConsumerAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataEntityAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataInputAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataQualityTestAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataSetAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataTransformerAttributes;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
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
import static java.util.function.Function.identity;
import static java.util.function.Predicate.not;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.mapping;
import static java.util.stream.Collectors.toList;
import static org.jooq.impl.DSL.count;
import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.jooq.impl.DSL.max;
import static org.jooq.impl.DSL.name;
import static org.jooq.impl.DSL.val;
import static org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto.DataInputDetailsDto;
import static org.opendatadiscovery.oddplatform.dto.LineageStreamKind.DOWNSTREAM;
import static org.opendatadiscovery.oddplatform.dto.LineageStreamKind.UPSTREAM;
import static org.opendatadiscovery.oddplatform.model.Tables.ALERT;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_VERSION;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_ENTITY_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_PARENT_GROUP_RELATIONS;
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

@Repository
@Slf4j
public class DataEntityRepositoryImpl
    extends AbstractCRUDRepository<DataEntityRecord, DataEntityDimensionsDto>
    implements DataEntityRepository {

    private static final int SUGGESTION_LIMIT = 5;

    private static final String DATA_ENTITY_CTE_NAME = "dataEntityCTE";

    private static final String AGG_TAGS_FIELD = "tag";
    private static final String AGG_OWNERSHIP_FIELD = "ownership";
    private static final String AGG_OWNER_FIELD = "owner";
    private static final String AGG_ROLE_FIELD = "role";
    private static final String AGG_ALERT_FIELD = "alert";
    private static final String AGG_PARENT_ENTITY_FIELD = "parent_entity";

    public static final TypeReference<Map<String, ?>> SPECIFIC_ATTRIBUTES_TYPE_REFERENCE = new TypeReference<>() {
    };

    private final JooqFTSHelper jooqFTSHelper;
    private final JooqRecordHelper jooqRecordHelper;

    private final DataEntityTaskRunRepository dataEntityTaskRunRepository;
    private final MetadataFieldValueRepository metadataFieldValueRepository;
    private final DatasetVersionRepository datasetVersionRepository;

    public DataEntityRepositoryImpl(final DSLContext dslContext,
                                    final JooqQueryHelper jooqQueryHelper,
                                    final JooqFTSHelper jooqFTSHelper,
                                    final JooqRecordHelper jooqRecordHelper,
                                    final DataEntityTaskRunRepository dataEntityTaskRunRepository,
                                    final MetadataFieldValueRepository metadataFieldValueRepository,
                                    final DatasetVersionRepository datasetVersionRepository) {
        super(dslContext, jooqQueryHelper, DATA_ENTITY, DATA_ENTITY.ID, null, DataEntityDimensionsDto.class);

        this.jooqFTSHelper = jooqFTSHelper;
        this.jooqRecordHelper = jooqRecordHelper;
        this.dataEntityTaskRunRepository = dataEntityTaskRunRepository;
        this.metadataFieldValueRepository = metadataFieldValueRepository;
        this.datasetVersionRepository = datasetVersionRepository;
    }

    @Override
    public Optional<DataEntityDimensionsDto> get(final long id) {
        final DataEntitySelectConfig config = DataEntitySelectConfig.builder()
            .cteSelectConditions(singletonList(DATA_ENTITY.ID.eq(id)))
            .build();

        return dataEntitySelect(config)
            .fetchOptional(this::mapDimensionRecord)
            .map(this::enrichDataEntityDimensionsDto);
    }

    @Override
    public List<DataEntityPojo> bulkCreate(final List<DataEntityPojo> pojos) {
        if (pojos.isEmpty()) {
            return List.of();
        }

        return bulkInsert(pojos, DataEntityPojo.class);
    }

    @Override
    public List<DataEntityPojo> bulkUpdate(final List<DataEntityPojo> pojos) {
        if (pojos.isEmpty()) {
            return List.of();
        }

        final List<DataEntityRecord> records = pojos.stream()
            .map(e -> dslContext.newRecord(recordTable, e))
            .map(r -> changedToFalse(r, List.of(
                DATA_ENTITY.INTERNAL_DESCRIPTION,
                DATA_ENTITY.INTERNAL_NAME,
                DATA_ENTITY.VIEW_COUNT,
                DATA_ENTITY.EXCLUDE_FROM_SEARCH
            )))
            .collect(toList());

        dslContext.batchUpdate(records).execute();

        return pojos;
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
        var step = dslContext
            .insertInto(DATA_ENTITY, DATA_ENTITY.ODDRN, DATA_ENTITY.HOLLOW, DATA_ENTITY.EXCLUDE_FROM_SEARCH);

        for (final String oddrn : oddrns) {
            step = step.values(oddrn, true, true);
        }

        step.onDuplicateKeyIgnore().execute();
    }

    @Override
    public Page<DataEntityDimensionsDto> list(final int page, final int size, final String query) {
        return Page.<DataEntityDimensionsDto>builder()
            .hasNext(false)
            .total(fetchCount(query))
            .data(listByConfig(DataEntitySelectConfig.builder().build()))
            .build();
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
            // TODO: if owner is null no need to join
            .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(OWNER).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .join(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
            .where(jooqFTSHelper.facetStateConditions(state, true, true))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .and(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()));

        if (StringUtils.isNotEmpty(state.getQuery())) {
            query = query.and(jooqFTSHelper.ftsCondition(state.getQuery()));
        }

        if (owner != null) {
            query = query.and(OWNER.ID.eq(owner.getId()));
        }

        return query.fetchOneInto(Long.class);
    }

    @Override
    public Collection<DataEntityDetailsDto> listDetailsByOddrns(final Collection<String> oddrns) {
        final DataEntitySelectConfig config = DataEntitySelectConfig.builder()
            .cteSelectConditions(singletonList(DATA_ENTITY.ODDRN.in(CollectionUtils.emptyIfNull(oddrns))))
            .build();

        return enrichDataEntityDimensionsDto(dataEntitySelect(config)
            .fetchStream()
            .map(this::mapDetailsRecord)
            .collect(toList()));
    }

    @Override
    public List<DataEntityDto> listDtosByOddrns(final Collection<String> oddrns) {
        if (CollectionUtils.isEmpty(oddrns)) {
            return emptyList();
        }

        final DataEntitySelectConfig config = DataEntitySelectConfig.builder()
            .cteSelectConditions(singletonList(DATA_ENTITY.ODDRN.in(oddrns)))
            .build();

        return dataEntitySelect(config)
            .fetchStream()
            .map(this::mapDtoRecord)
            .toList();
    }

    @Override
    public List<DataEntityDimensionsDto> listDimensionsByOddrns(final Collection<String> oddrns) {
        return listAllByOddrns(oddrns, null, null, false);
    }

    private List<DataEntityDimensionsDto> listAllByOddrns(final Collection<String> oddrns,
                                                          final Integer page,
                                                          final Integer size,
                                                          final boolean skipHollow) {
        if (CollectionUtils.isEmpty(oddrns)) {
            return emptyList();
        }

        DataEntitySelectConfig.DataEntitySelectConfigBuilder configBuilder = DataEntitySelectConfig.builder()
            .cteSelectConditions(singletonList(DATA_ENTITY.ODDRN.in(oddrns)))
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
                                                    final int typeId,
                                                    final Integer subTypeId) {
        final List<Condition> cteSelectConditions = Stream
            .of(DATA_ENTITY.TYPE_IDS.contains(new Integer[] {typeId}),
                subTypeId != null ? DATA_ENTITY.SUBTYPE_ID.eq(subTypeId) : null)
            .filter(Objects::nonNull)
            .collect(toList());

        final DataEntitySelectConfig config = DataEntitySelectConfig
            .builder()
            .cteSelectConditions(cteSelectConditions)
            .cteLimitOffset(new DataEntitySelectConfig.LimitOffset(size, (page - 1) * size))
            .build();

        return listByConfig(config);
    }

    @Override
    public List<DataEntityDto> listByOwner(final int page, final int size, final long ownerId) {
        final DataEntitySelectConfig config = DataEntitySelectConfig.builder()
            .selectConditions(singletonList(OWNERSHIP.OWNER_ID.eq(ownerId)))
            .build();

        return dataEntitySelect(config)
            .limit(size)
            .offset((page - 1) * size)
            .fetchStream()
            .map(this::mapDtoRecord)
            .collect(toList());
    }

    @Override
    public List<? extends DataEntityDto> listByOwner(final int page,
                                                     final int size,
                                                     final long ownerId,
                                                     final LineageStreamKind streamKind) {
        final DataEntitySelectConfig config = DataEntitySelectConfig.builder()
            .selectConditions(singletonList(OWNERSHIP.OWNER_ID.eq(ownerId)))
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
            .collect(toList());

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
    @Transactional
    public Optional<DataEntityDetailsDto> getDetails(final long id) {
        final DataEntitySelectConfig config = DataEntitySelectConfig.builder()
            .cteSelectConditions(singletonList(DATA_ENTITY.ID.eq(id)))
            .build();

        return dataEntitySelect(config)
            .fetchOptional(this::mapDetailsRecord)
            .map(this::enrichDataEntityDimensionsDto)
            .map(this::enrichDataEntityDetailsDto);
    }

    @Override
    public List<DataEntityDimensionsDto> getDataEntityGroupsChildren(final Long dataEntityGroupId,
                                                                     final Integer page,
                                                                     final Integer size) {
        final DataEntitySelectConfig config = DataEntitySelectConfig
            .builder()
            .selectConditions(List.of(DATA_ENTITY.as(AGG_PARENT_ENTITY_FIELD).ID.eq(dataEntityGroupId)))
            .build();

        final List<DataEntityDimensionsDto> entities = dataEntitySelect(config)
            .limit(size)
            .offset((page - 1) * size)
            .fetchStream()
            .map(this::mapDimensionRecord)
            .toList();

        return enrichDataEntityDimensionsDto(entities);
    }

    @Override
    public Page<DataEntityDimensionsDto> findByState(final FacetStateDto state,
                                                     final int page,
                                                     final int size) {
        return findByState(state, page, size, null);
    }

    @Override
    @Transactional
    public Page<DataEntityDimensionsDto> findByState(final FacetStateDto state,
                                                     final int page,
                                                     final int size,
                                                     final OwnerPojo owner) {
        final Pair<List<Condition>, List<Condition>> conditionsPair =
            jooqFTSHelper.resultFacetStateConditions(state, state.isMyObjects());

        final List<Condition> joinConditions = new ArrayList<>(conditionsPair.getRight());

        if (owner != null) {
            joinConditions.add(OWNER.ID.eq(owner.getId()));
        }

        DataEntitySelectConfig.DataEntitySelectConfigBuilder builder = DataEntitySelectConfig
            .builder()
            .cteSelectConditions(conditionsPair.getLeft())
            .selectConditions(joinConditions);

        if (StringUtils.isNotEmpty(state.getQuery())) {
            builder = builder.fts(
                new DataEntitySelectConfig.Fts(state.getQuery()));
        }

        final SelectLimitStep<Record> baseQuery = dataEntitySelect(builder.build());

        final Long total = fetchCount(baseQuery);

        final List<DataEntityDimensionsDto> entities = baseQuery
            .offset((page - 1) * size)
            .limit(size)
            .fetchStream()
            .map(this::mapDimensionRecord)
            .toList();

        return Page.<DataEntityDimensionsDto>builder()
            .data(enrichDataEntityDimensionsDto(entities))
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
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .and(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()));

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
            .join(DATA_ENTITY).on(DATA_ENTITY.DATA_SOURCE_ID.eq(DATA_SOURCE.ID))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .and(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()))
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
            .join(DATA_ENTITY).on(DATA_ENTITY.DATA_SOURCE_ID.eq(DATA_SOURCE.ID))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .and(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()))
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
            .and(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()))
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

        final Field<?> rankField = jooqFTSHelper.ftsRankField(SEARCH_ENTRYPOINT.SEARCH_VECTOR, query);
        final Field<Object> rankFieldAlias = field("rank", Object.class);

        final Select<Record> dataEntitySelect = dslContext
            .select(DATA_ENTITY.fields())
            .select(rankField.as(rankFieldAlias))
            .from(SEARCH_ENTRYPOINT)
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
            .where(jooqFTSHelper.ftsCondition(query))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .orderBy(rankFieldAlias.desc())
            .limit(SUGGESTION_LIMIT);

        final Table<Record> deCte = dataEntitySelect.asTable(deCteName);

        return dslContext.with(deCteName)
            .asMaterialized(dataEntitySelect)
            .select(deCte.fields())
            .select(jsonArrayAgg(field(ALERT.asterisk().toString())).as(AGG_ALERT_FIELD))
            .from(deCteName)
            .leftJoin(ALERT).on(ALERT.DATA_ENTITY_ODDRN.eq(deCte.field(DATA_ENTITY.ODDRN)))
            .groupBy(deCte.fields())
            .orderBy(jooqQueryHelper.getField(deCte, rankFieldAlias).desc())
            .fetchStream()
            .map(this::mapDtoRecord)
            .collect(toList());
    }

    @Override
    public Optional<DataEntityGroupLineageDto> getDataEntityGroupLineage(final Long dataEntityGroupId) {
        final List<String> entitiesOddrns = getDEGEntitiesOddrns(dataEntityGroupId);
        if (CollectionUtils.isEmpty(entitiesOddrns)) {
            return Optional.empty();
        }

        final Map<String, DataEntityDimensionsDto> dtoDict = listDimensionsByOddrns(entitiesOddrns)
            .stream()
            .collect(Collectors.toMap(d -> d.getDataEntity().getOddrn(), identity()));

        final List<LineagePojo> lineageRelations = getLineageRelations(entitiesOddrns);
        final List<Set<String>> oddrnRelations = lineageRelations.stream()
            .map(lineagePojo -> Set.of(lineagePojo.getChildOddrn(), lineagePojo.getParentOddrn()))
            .collect(toList());
        final List<Set<String>> combinedOddrnsList = combineOddrnsInDEGLineage(oddrnRelations);

        final List<DataEntityLineageStreamDto> items = combinedOddrnsList.stream()
            .map(combinedOddrns -> {
                final DataEntityLineageStreamDto dto = new DataEntityLineageStreamDto();
                final List<DataEntityDimensionsDto> nodes = combinedOddrns.stream()
                    .map(dtoDict::get)
                    .toList();
                dto.setNodes(nodes);
                final List<Pair<Long, Long>> edges = combinedOddrns.stream()
                    .flatMap(oddrn -> lineageRelations.stream()
                        .filter(relations -> relations.getChildOddrn().equals(oddrn))
                        .map(r -> Pair.of(
                            dtoDict.get(r.getParentOddrn()).getDataEntity().getId(),
                            dtoDict.get(r.getChildOddrn()).getDataEntity().getId()
                        ))).toList();
                dto.setEdges(edges);
                return dto;
            }).toList();

        return Optional.of(new DataEntityGroupLineageDto(items));
    }

    @Override
    @Transactional
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

        final Map<String, List<String>> groupRelations = fetchGroupRepository(oddrnsToFetch);

        final Map<String, DataEntityDimensionsDto> dtoRepository =
            listDimensionsByOddrns(SetUtils.union(oddrnsToFetch, groupRelations.keySet()))
                .stream()
                .collect(Collectors.toMap(d -> d.getDataEntity().getOddrn(), identity()));

        final Map<DataEntityDimensionsDto, List<String>> groupRepository = groupRelations.entrySet()
            .stream()
            .map(e -> {
                final DataEntityDimensionsDto groupDto = dtoRepository.get(e.getKey());
                if (groupDto == null) {
                    return null;
                }

                return Pair.of(groupDto, e.getValue());
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));

        return DataEntityLineageDto.builder()
            .dataEntityDto(dto)
            .upstream(getLineageStream(dtoRepository, groupRepository, upstreamRelations))
            .downstream(getLineageStream(dtoRepository, groupRepository, downstreamRelations))
            .build();
    }

    private Map<String, List<String>> fetchGroupRepository(final Collection<String> childOddrns) {
        if (CollectionUtils.isEmpty(childOddrns)) {
            return Map.of();
        }

        return dslContext
            .select(
                GROUP_ENTITY_RELATIONS.GROUP_ODDRN,
                GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN
            )
            .from(GROUP_ENTITY_RELATIONS)
            .where(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.in(childOddrns))
            .fetchGroups(GROUP_ENTITY_RELATIONS.GROUP_ODDRN, GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN);
    }

    private List<Set<String>> combineOddrnsInDEGLineage(final List<Set<String>> oddrnRelations) {
        final List<Set<String>> result = new ArrayList<>();
        oddrnRelations.forEach(relations -> {
            final Set<String> combinedRelations = result.stream()
                .filter(rel -> rel.stream().anyMatch(relations::contains))
                .findFirst()
                .orElseGet(() -> {
                    final Set<String> newRelationSet = new HashSet<>();
                    result.add(newRelationSet);
                    return newRelationSet;
                });
            combinedRelations.addAll(relations);
        });

        if (result.size() == oddrnRelations.size()) {
            return result;
        } else {
            return combineOddrnsInDEGLineage(result);
        }
    }

    private List<String> getDEGEntitiesOddrns(final long dataEntityGroupId) {
        final Name cteName = name("t");
        final Field<String> tDataEntityOddrn = field("t.data_entity_oddrn", String.class);

        final String groupOddrn = dslContext.select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .where(DATA_ENTITY.ID.eq(dataEntityGroupId))
            .fetchOptionalInto(String.class)
            .orElseThrow(NotFoundException::new);

        final var cte = cteName.as(dslContext
            .select(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN)
            .from(GROUP_ENTITY_RELATIONS)
            .where(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(groupOddrn))
            .unionAll(
                dslContext
                    .select(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN)
                    .from(GROUP_ENTITY_RELATIONS)
                    .join(cteName).on(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(tDataEntityOddrn))
            ));

        return dslContext.withRecursive(cte)
            .selectDistinct(cte.field(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN))
            .from(cte.getName())
            .fetchStreamInto(String.class)
            .collect(toList());
    }

    private List<LineagePojo> getLineageRelations(final List<String> oddrns) {
        return dslContext.selectDistinct(LINEAGE.PARENT_ODDRN, LINEAGE.CHILD_ODDRN)
            .from(LINEAGE)
            .where(LINEAGE.PARENT_ODDRN.in(oddrns).and(LINEAGE.CHILD_ODDRN.in(oddrns)))
            .fetchStreamInto(LineagePojo.class)
            .collect(toList());
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

    private DataEntityLineageStreamDto getLineageStream(
        final Map<String, DataEntityDimensionsDto> dtoRepository,
        final Map<DataEntityDimensionsDto, List<String>> groupRepository,
        final List<LineagePojo> relations
    ) {
        final List<Pair<Long, Long>> edges = relations.stream()
            .map(r -> Pair.of(
                dtoRepository.get(r.getParentOddrn()).getDataEntity().getId(),
                dtoRepository.get(r.getChildOddrn()).getDataEntity().getId()
            ))
            .collect(toList());

        final List<DataEntityDimensionsDto> nodes = relations.stream()
            .flatMap(r -> Stream.of(r.getParentOddrn(), r.getChildOddrn()))
            .distinct()
            .map(deOddrn -> Optional.ofNullable(dtoRepository.get(deOddrn))
                .orElseThrow(() -> new IllegalArgumentException(
                    String.format("Entity with oddrn %s wasn't fetched", deOddrn)))
            )
            .collect(toList());

        final Map<Long, List<Long>> groupRelations = groupRepository.entrySet()
            .stream()
            .flatMap(e -> e.getValue()
                .stream()
                .map(deOddrn -> {
                    final long groupId = e.getKey().getDataEntity().getId();

                    final long entityId = Optional.ofNullable(dtoRepository.get(deOddrn))
                        .map(d -> d.getDataEntity().getId())
                        .orElseThrow(() -> new IllegalArgumentException(
                            String.format("Entity with oddrn %s wasn't fetched", deOddrn)));

                    return Pair.of(entityId, groupId);
                }))
            .collect(groupingBy(Pair::getLeft, mapping(Pair::getRight, toList())));

        return DataEntityLineageStreamDto.builder()
            .edges(edges)
            .nodes(nodes)
            .groups(groupRepository.keySet())
            .groupsRelations(groupRelations)
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
            .collect(toList());
    }

    private List<DataEntityDimensionsDto> listByConfig(final DataEntitySelectConfig config) {
        final List<DataEntityDimensionsDto> entities = dataEntitySelect(config)
            .fetchStream()
            .map(this::mapDimensionRecord)
            .toList();

        return enrichDataEntityDimensionsDto(entities);
    }

    private SelectLimitStep<Record> dataEntitySelect(final DataEntitySelectConfig config) {
        final Name deCteName = name(DATA_ENTITY_CTE_NAME);

        final Select<Record> dataEntitySelect = cteDataEntitySelect(config);
        final Table<Record> deCte = dataEntitySelect.asTable(deCteName);

        final List<Field<?>> selectFields = Stream
            .of(
                deCte.fields(),
                NAMESPACE.fields(),
                DATA_SOURCE.fields()
            )
            .flatMap(Arrays::stream)
            .collect(toList());

        SelectSelectStep<Record> selectStep = dslContext.with(deCteName)
            .asMaterialized(dataEntitySelect)
            .select(selectFields);

        if (config.isDimensions()) {
            selectStep = selectStep
                .select(jsonArrayAgg(field(TAG.asterisk().toString())).as(AGG_TAGS_FIELD))
                .select(jsonArrayAgg(field(OWNER.asterisk().toString())).as(AGG_OWNER_FIELD))
                .select(jsonArrayAgg(field(ROLE.asterisk().toString())).as(AGG_ROLE_FIELD))
                .select(jsonArrayAgg(field(OWNERSHIP.asterisk().toString())).as(AGG_OWNERSHIP_FIELD));
        }

        SelectJoinStep<Record> fromStep = selectStep.from(deCteName);

        if (config.isDimensions()) {
            fromStep = fromStep
                .leftJoin(DATA_SOURCE)
                .on(DATA_SOURCE.ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.DATA_SOURCE_ID)))
                .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
                .leftJoin(TAG_TO_DATA_ENTITY)
                .on(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID)))
                .leftJoin(TAG).on(TAG.ID.eq(TAG_TO_DATA_ENTITY.TAG_ID))
                .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID)))
                .leftJoin(OWNER).on(OWNER.ID.eq(OWNERSHIP.OWNER_ID))
                .leftJoin(ROLE).on(ROLE.ID.eq(OWNERSHIP.ROLE_ID));
        }

        final SelectHavingStep<Record> groupByStep = fromStep
            .where(ListUtils.emptyIfNull(config.getSelectConditions()))
            .groupBy(selectFields);

        return config.getFts() != null
            ? groupByStep.orderBy(jooqQueryHelper.getField(deCte, config.getFts().rankFieldAlias()).desc())
            : groupByStep;
    }

    private void enrichDatasetVersions(final DataEntityDetailsDto dto) {
        if (!ArrayUtils.contains(dto.getDataEntity().getTypeIds(), DataEntityTypeDto.DATA_SET.getId())) {
            return;
        }

        final List<DatasetVersionPojo> versions = datasetVersionRepository.getVersions(dto.getDataEntity().getOddrn());

        dto.setDatasetVersions(versions);
    }

    private void enrichDetailsWithMetadata(final DataEntityDetailsDto dto) {
        dto.setMetadata(metadataFieldValueRepository.getDtosByDataEntityId(dto.getDataEntity().getId()));
    }

    private <T extends DataEntityDimensionsDto> void enrichDEGDetails(final T dto) {
        if (!ArrayUtils.contains(dto.getDataEntity().getTypeIds(), DataEntityTypeDto.DATA_ENTITY_GROUP.getId())) {
            return;
        }

        final List<DataEntityPojo> entities = dslContext.select(DATA_ENTITY.fields())
            .from(GROUP_ENTITY_RELATIONS)
            .leftJoin(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN))
            .where(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(dto.getDataEntity().getOddrn()))
            .fetchStreamInto(DataEntityPojo.class)
            .toList();

        Long childrenCount = dslContext.selectCount()
            .from(GROUP_PARENT_GROUP_RELATIONS)
            .where(GROUP_PARENT_GROUP_RELATIONS.GROUP_ODDRN.eq(dto.getDataEntity().getOddrn()))
            .fetchOneInto(Long.class);

        if (childrenCount == null) {
            childrenCount = 0L;
        }

        dto.setGroupsDto(new DataEntityDimensionsDto.DataEntityGroupDimensionsDto(
            entities,
            entities.size() + childrenCount.intValue(),
            childrenCount != 0L
        ));
    }

    private <T extends DataEntityDimensionsDto> void enrichDEGDetails(final List<T> dtos) {
        final Set<String> degOddrns = dtos.stream()
            .map(DataEntityDto::getDataEntity)
            .filter(d -> ArrayUtils.contains(d.getTypeIds(), DataEntityTypeDto.DATA_ENTITY_GROUP.getId()))
            .map(DataEntityPojo::getOddrn)
            .collect(Collectors.toSet());

        if (degOddrns.isEmpty()) {
            return;
        }

        final Map<String, List<DataEntityPojo>> entityRepository = dslContext
            .select(GROUP_ENTITY_RELATIONS.GROUP_ODDRN)
            .select(DATA_ENTITY.fields())
            .from(GROUP_ENTITY_RELATIONS)
            .leftJoin(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN))
            .where(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.in(degOddrns))
            .fetchGroups(GROUP_ENTITY_RELATIONS.GROUP_ODDRN, DataEntityPojo.class);

        final Field<Long> childrenCountField = field("children_count", Long.class);

        final Map<String, Long> countRepository = dslContext
            .select(GROUP_PARENT_GROUP_RELATIONS.PARENT_GROUP_ODDRN)
            .select(count(GROUP_PARENT_GROUP_RELATIONS.GROUP_ODDRN).as(childrenCountField))
            .from(GROUP_PARENT_GROUP_RELATIONS)
            .where(GROUP_PARENT_GROUP_RELATIONS.PARENT_GROUP_ODDRN.in(degOddrns))
            .groupBy(GROUP_PARENT_GROUP_RELATIONS.PARENT_GROUP_ODDRN)
            .fetchMap(GROUP_PARENT_GROUP_RELATIONS.PARENT_GROUP_ODDRN, childrenCountField);

        for (final T dto : dtos) {
            final String oddrn = dto.getDataEntity().getOddrn();

            if (!degOddrns.contains(oddrn)) {
                continue;
            }

            final List<DataEntityPojo> entityList = ListUtils.emptyIfNull(entityRepository.get(oddrn));
            final Long childrenCount = ObjectUtils.defaultIfNull(countRepository.get(oddrn), 0L);

            dto.setGroupsDto(new DataEntityDimensionsDto.DataEntityGroupDimensionsDto(
                entityList,
                entityList.size() + childrenCount.intValue(),
                childrenCount != 0L
            ));
        }
    }

    private <T extends DataEntityDimensionsDto> void enrichParentDEGs(final T dto) {
        final Field<String> degOddrnField = field("deg_oddrn", String.class);
        final String cteName = "cte";

        final SelectOrderByStep<Record1<String>> cteSelect =
            dslContext.select(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.as(degOddrnField))
                .from(GROUP_ENTITY_RELATIONS)
                .where(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(dto.getDataEntity().getOddrn()))
                .union(dslContext.select(GROUP_PARENT_GROUP_RELATIONS.PARENT_GROUP_ODDRN.as(degOddrnField))
                    .from(GROUP_PARENT_GROUP_RELATIONS)
                    .where(GROUP_PARENT_GROUP_RELATIONS.GROUP_ODDRN.eq(dto.getDataEntity().getOddrn())));

        final Table<Record1<String>> selectTable = cteSelect.asTable(cteName);

        final List<DataEntityPojo> parentGroups = dslContext.with(cteName)
            .as(cteSelect)
            .select(DATA_ENTITY.fields())
            .from(cteName)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(jooqQueryHelper.getField(selectTable, degOddrnField)))
            .fetchStreamInto(DataEntityPojo.class)
            .toList();

        dto.setParentGroups(parentGroups);
    }

    private <T extends DataEntityDimensionsDto> void enrichParentDEGs(final List<T> dto) {
        final Set<String> oddrns = dto.stream()
            .map(d -> d.getDataEntity().getOddrn())
            .collect(Collectors.toSet());

        final Field<String> degOddrnField = field("deg_oddrn", String.class);
        final String cteName = "cte";

        final SelectOrderByStep<Record> cteSelect = dslContext
            .select(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN)
            .select(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.as(degOddrnField))
            .from(GROUP_ENTITY_RELATIONS)
            .where(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.in(oddrns))
            .union(dslContext
                .select(GROUP_PARENT_GROUP_RELATIONS.PARENT_GROUP_ODDRN)
                .select(GROUP_PARENT_GROUP_RELATIONS.GROUP_ODDRN.as(degOddrnField))
                .from(GROUP_PARENT_GROUP_RELATIONS)
                .where(GROUP_PARENT_GROUP_RELATIONS.GROUP_ODDRN.in(oddrns)));

        final Table<Record> selectTable = cteSelect.asTable(cteName);

        final Field<String> deOddrnField =
            jooqQueryHelper.getField(selectTable, GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN);

        final Map<String, List<DataEntityPojo>> repository = dslContext.with(cteName)
            .as(cteSelect)
            .select(deOddrnField)
            .select(DATA_ENTITY.fields())
            .from(cteName)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(jooqQueryHelper.getField(selectTable, degOddrnField)))
            .fetchGroups(deOddrnField, DataEntityPojo.class);

        for (final T t : dto) {
            t.setParentGroups(repository.get(t.getDataEntity().getOddrn()));
        }
    }

    private DataEntityDetailsDto enrichDataEntityDetailsDto(final DataEntityDetailsDto dto) {
        enrichDetailsWithMetadata(dto);
        enrichDatasetVersions(dto);

        return dto;
    }

    private <T extends DataEntityDimensionsDto> T enrichDataEntityDimensionsDto(final T dto) {
        final Set<String> deps = dto.getSpecificAttributes().values().stream()
            .map(DataEntityAttributes::getDependentOddrns)
            .flatMap(Set::stream)
            .collect(Collectors.toSet());

        final Map<String, DataEntityDto> depsRepository = listDtosByOddrns(deps)
            .stream()
            .collect(Collectors.toMap(d -> d.getDataEntity().getOddrn(), identity()));

        enrichDataEntityDimensionsDto(dto, depsRepository);
        enrichDEGDetails(dto);
        enrichParentDEGs(dto);

        return dto;
    }

    private <T extends DataEntityDimensionsDto> List<T> enrichDataEntityDimensionsDto(final List<T> dtos) {
        final Set<String> deps = dtos.stream().map(DataEntityDto::getSpecificAttributes)
            .map(Map::values)
            .flatMap(Collection::stream)
            .map(DataEntityAttributes::getDependentOddrns)
            .flatMap(Set::stream)
            .collect(Collectors.toSet());

        final Map<String, DataEntityDto> depsRepository = listDtosByOddrns(deps)
            .stream()
            .collect(Collectors.toMap(dto -> dto.getDataEntity().getOddrn(), identity()));

        for (final T dto : dtos) {
            enrichDataEntityDimensionsDto(dto, depsRepository);
        }

        enrichParentDEGs(dtos);
        enrichDEGDetails(dtos);

        return dtos;
    }

    private void enrichDataEntityDimensionsDto(final DataEntityDimensionsDto dto,
                                               final Map<String, DataEntityDto> depsRepository) {
        final Function<Collection<String>, Collection<? extends DataEntityDto>> fetcher = oddrns -> oddrns.stream()
            .map(depsRepository::get)
            .filter(Objects::nonNull)
            .collect(toList());

        dto.getSpecificAttributes().forEach((t, attrs) -> {
            switch (t) {
                case DATA_SET:
                    final DataSetAttributes dsa = (DataSetAttributes) attrs;

                    dto.setDataSetDetailsDto(new DataEntityDetailsDto.DataSetDetailsDto(
                        dsa.getRowsCount(),
                        dsa.getFieldsCount(),
                        dsa.getConsumersCount()
                    ));

                    break;

                case DATA_TRANSFORMER:
                    final DataTransformerAttributes dta = (DataTransformerAttributes) attrs;
                    final DataTransformerDetailsDto dataTransformerDetailsDto =
                        new DataTransformerDetailsDto(fetcher.apply(dta.getSourceOddrnList()),
                            fetcher.apply(dta.getTargetOddrnList()),
                            dta.getSourceCodeUrl());
                    dto.setDataTransformerDetailsDto(dataTransformerDetailsDto);

                    break;

                case DATA_QUALITY_TEST:
                    final DataQualityTestAttributes dqta = (DataQualityTestAttributes) attrs;
                    final DataEntityTaskRunPojo latestTaskRun = dataEntityTaskRunRepository
                        .getLatestRun(dto.getDataEntity().getOddrn())
                        .orElse(null);
                    final DataQualityTestDetailsDto dataQualityTestDetailsDto =
                        new DataQualityTestDetailsDto(dqta.getSuiteName(), dqta.getSuiteUrl(),
                            fetcher.apply(dqta.getDatasetOddrnList()), dqta.getLinkedUrlList(),
                            dqta.getExpectation().getType(), latestTaskRun,
                            dqta.getExpectation().getAdditionalProperties());
                    dto.setDataQualityTestDetailsDto(dataQualityTestDetailsDto);
                    break;

                case DATA_CONSUMER:
                    final DataConsumerAttributes dca = (DataConsumerAttributes) attrs;

                    dto.setDataConsumerDetailsDto(new DataConsumerDetailsDto(fetcher.apply(dca.getInputListOddrn())));
                    break;

                case DATA_INPUT:
                    final DataInputAttributes dia = (DataInputAttributes) attrs;

                    dto.setDataInputDetailsDto(new DataInputDetailsDto(fetcher.apply(dia.getOutputListOddrn())));
                    break;

                default:
                    break;
            }
        });
    }

    private DataEntityDto mapDtoRecord(final Record r) {
        final Record deRecord = jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY);

        final DataEntityPojo dataEntity = jooqRecordHelper.extractRelation(deRecord, DATA_ENTITY, DataEntityPojo.class);

        return DataEntityDto.builder()
            .dataEntity(dataEntity)
            .hasAlerts(!jooqRecordHelper.extractAggRelation(r, AGG_ALERT_FIELD, AlertPojo.class).isEmpty())
            .specificAttributes(extractSpecificAttributes(dataEntity))
            .build();
    }

    private DataEntityDimensionsDto mapDimensionRecord(final Record r) {
        final Record deRecord = jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY);
        final DataEntityPojo dataEntity = jooqRecordHelper.extractRelation(deRecord, DATA_ENTITY, DataEntityPojo.class);

        return DataEntityDimensionsDto.dimensionsBuilder()
            .dataEntity(dataEntity)
            .hasAlerts(!jooqRecordHelper.extractAggRelation(r, AGG_ALERT_FIELD, AlertPojo.class).isEmpty())
            .dataSource(jooqRecordHelper.extractRelation(r, DATA_SOURCE, DataSourcePojo.class))
            .specificAttributes(extractSpecificAttributes(dataEntity))
            .namespace(jooqRecordHelper.extractRelation(r, NAMESPACE, NamespacePojo.class))
            .ownership(extractOwnershipRelation(r))
            .tags(jooqRecordHelper.extractAggRelation(r, AGG_TAGS_FIELD, TagPojo.class))
            .build();
    }

    private DataEntityDetailsDto mapDetailsRecord(final Record r) {
        final Record deRecord = jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY);
        final DataEntityPojo dataEntity = jooqRecordHelper.extractRelation(deRecord, DATA_ENTITY, DataEntityPojo.class);

        return DataEntityDetailsDto.detailsBuilder()
            .dataEntity(dataEntity)
            .hasAlerts(!jooqRecordHelper.extractAggRelation(r, AGG_ALERT_FIELD, AlertPojo.class).isEmpty())
            .dataSource(jooqRecordHelper.extractRelation(r, DATA_SOURCE, DataSourcePojo.class))
            .specificAttributes(extractSpecificAttributes(dataEntity))
            .namespace(jooqRecordHelper.extractRelation(r, NAMESPACE, NamespacePojo.class))
            .ownership(extractOwnershipRelation(r))
            .tags(jooqRecordHelper.extractAggRelation(r, AGG_TAGS_FIELD, TagPojo.class))
            .build();
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
            .collect(toList());
    }

    private Map<DataEntityTypeDto, DataEntityAttributes> extractSpecificAttributes(final DataEntityPojo dataEntity
    ) {
        if (dataEntity.getHollow()) {
            return emptyMap();
        }

        final Map<String, ?> specificAttributes = JSONSerDeUtils.deserializeJson(
            dataEntity.getSpecificAttributes().data(),
            SPECIFIC_ATTRIBUTES_TYPE_REFERENCE
        );

        return DataEntityTypeDto.findByIds(dataEntity.getTypeIds())
            .stream()
            .map(t -> Pair.of(t, JSONSerDeUtils.deserializeJson(
                specificAttributes.get(t.toString()),
                DataEntityAttributes.TYPE_TO_ATTR_CLASS.get(t)
            )))
            .filter(p -> p.getRight() != null)
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));
    }

    private Select<Record> cteDataEntitySelect(final DataEntitySelectConfig config) {
        Select<Record> dataEntitySelect;

        final ArrayList<OrderField<?>> orderFields = new ArrayList<>();

        if (config.getFts() != null) {
            final Field<?> rankField = jooqFTSHelper.ftsRankField(
                SEARCH_ENTRYPOINT.SEARCH_VECTOR,
                config.getFts().query()
            );

            orderFields.add(config.getFts().rankFieldAlias().desc());

            dataEntitySelect = dslContext
                .select(DATA_ENTITY.fields())
                .select(rankField.as(config.getFts().rankFieldAlias()))
                .from(SEARCH_ENTRYPOINT)
                .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
                .where(ListUtils.emptyIfNull(config.getCteSelectConditions()))
                .and(jooqFTSHelper.ftsCondition(config.getFts().query()));
        } else {
            dataEntitySelect = dslContext.select(DATA_ENTITY.fields())
                .from(DATA_ENTITY)
                .where(ListUtils.emptyIfNull(config.getCteSelectConditions()));
        }

        if (!config.isIncludeHollow()) {
            dataEntitySelect = ((SelectConditionStep<Record>) dataEntitySelect)
                .and(DATA_ENTITY.HOLLOW.isFalse());
        }

        if (config.getOrderBy() != null) {
            orderFields.add(config.getOrderBy());
        }

        if (!orderFields.isEmpty()) {
            dataEntitySelect = ((SelectConditionStep<Record>) dataEntitySelect).orderBy(orderFields);
        }

        if (config.getCteLimitOffset() != null) {
            dataEntitySelect = ((SelectConditionStep<Record>) dataEntitySelect)
                .limit(config.getCteLimitOffset().limit())
                .offset(config.getCteLimitOffset().offset());
        }

        return dataEntitySelect;
    }

    @Builder
    @Data
    private static class DataEntitySelectConfig {
        private List<Condition> cteSelectConditions;
        private LimitOffset cteLimitOffset;
        private List<Condition> selectConditions;
        private boolean includeHollow;

        @Builder.Default
        private boolean dimensions = true;

        private SortField<?> orderBy;
        private Fts fts;

        private record LimitOffset(int limit, int offset) {
        }

        private record Fts(Field<?> rankFieldAlias, String query) {
            Fts(final String query) {
                this(field("rank", Object.class), query);
            }
        }
    }
}
