package org.opendatadiscovery.oddplatform.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.ListUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Name;
import org.jooq.OrderField;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SelectHavingStep;
import org.jooq.SelectJoinStep;
import org.jooq.SelectLimitStep;
import org.jooq.SelectOrderByStep;
import org.jooq.SelectSelectStep;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.opendatadiscovery.oddplatform.annotation.BlockingTransactional;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto.DataConsumerDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto.DataQualityTestDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto.DataTransformerDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.attributes.DataConsumerAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataEntityAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataInputAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataQualityTestAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataSetAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataTransformerAttributes;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageDepth;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityRecord;
import org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Repository;

import static java.util.Collections.emptyList;
import static java.util.Collections.emptyMap;
import static java.util.Collections.singletonList;
import static java.util.function.Function.identity;
import static java.util.function.Predicate.not;
import static java.util.stream.Collectors.toList;
import static org.jooq.impl.DSL.count;
import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.exists;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.jooq.impl.DSL.name;
import static org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto.DataInputDetailsDto;
import static org.opendatadiscovery.oddplatform.model.Tables.ALERT;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_ENTITY_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_PARENT_GROUP_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.TITLE;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.DATA_ENTITY_CONDITIONS;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.RANK_FIELD_ALIAS;

@Repository
@Slf4j
public class DataEntityRepositoryImpl
    extends AbstractCRUDRepository<DataEntityRecord, DataEntityDimensionsDto>
    implements DataEntityRepository {

    public static final TypeReference<Map<String, ?>> SPECIFIC_ATTRIBUTES_TYPE_REFERENCE = new TypeReference<>() {
    };
    private static final int SUGGESTION_LIMIT = 5;
    private static final String DATA_ENTITY_CTE_NAME = "dataEntityCTE";
    private static final String AGG_TAGS_RELATION_FIELD = "tags_relation";
    private static final String AGG_TAGS_FIELD = "tag";
    private static final String AGG_OWNERSHIP_FIELD = "ownership";
    private static final String AGG_OWNER_FIELD = "owner";
    private static final String AGG_TITLE_FIELD = "title";
    private static final String HAS_ALERTS_FIELD = "has_alerts";
    private static final String AGG_PARENT_ENTITY_FIELD = "parent_entity";
    private final JooqFTSHelper jooqFTSHelper;
    private final JooqRecordHelper jooqRecordHelper;

    private final DataEntityTaskRunRepository dataEntityTaskRunRepository;
    private final MetadataFieldValueRepository metadataFieldValueRepository;
    private final DatasetVersionRepository datasetVersionRepository;
    private final TermRepository termRepository;
    private final LineageRepository lineageRepository;

    public DataEntityRepositoryImpl(final DSLContext dslContext,
                                    final JooqQueryHelper jooqQueryHelper,
                                    final JooqFTSHelper jooqFTSHelper,
                                    final JooqRecordHelper jooqRecordHelper,
                                    final DataEntityTaskRunRepository dataEntityTaskRunRepository,
                                    final MetadataFieldValueRepository metadataFieldValueRepository,
                                    final DatasetVersionRepository datasetVersionRepository,
                                    final TermRepository termRepository,
                                    final LineageRepository lineageRepository) {
        super(dslContext, jooqQueryHelper, DATA_ENTITY, DATA_ENTITY.ID, null, null,
            DATA_ENTITY.UPDATED_AT, DataEntityDimensionsDto.class);

        this.jooqFTSHelper = jooqFTSHelper;
        this.jooqRecordHelper = jooqRecordHelper;
        this.dataEntityTaskRunRepository = dataEntityTaskRunRepository;
        this.metadataFieldValueRepository = metadataFieldValueRepository;
        this.datasetVersionRepository = datasetVersionRepository;
        this.termRepository = termRepository;
        this.lineageRepository = lineageRepository;
    }

    @Override
    public Optional<DataEntityDimensionsDto> get(final long id) {
        final DataEntityQueryConfig config = DataEntityQueryConfig.builder()
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

        final LocalDateTime now = LocalDateTime.now();
        final List<DataEntityRecord> records = pojos.stream()
            .map(e -> {
                final DataEntityRecord record = dslContext.newRecord(recordTable, e);
                record.set(DATA_ENTITY.UPDATED_AT, now);
                return record;
            })
            .map(r -> ignoreUpdate(r, List.of(
                DATA_ENTITY.INTERNAL_DESCRIPTION,
                DATA_ENTITY.INTERNAL_NAME,
                DATA_ENTITY.VIEW_COUNT
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
    public Page<DataEntityDimensionsDto> list(final int page, final int size, final String query) {
        return Page.<DataEntityDimensionsDto>builder()
            .hasNext(false)
            .total(fetchCount(query))
            .data(listByConfig(DataEntityQueryConfig.builder().build()))
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
            .leftJoin(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
            .where(jooqFTSHelper.facetStateConditions(state, DATA_ENTITY_CONDITIONS,
                List.of(FacetType.ENTITY_CLASSES)))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .and(DATA_ENTITY.DELETED_AT.isNull())
            .and(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()));

        if (StringUtils.isNotEmpty(state.getQuery())) {
            query = query.and(jooqFTSHelper.ftsCondition(SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
        }

        if (owner != null) {
            query = query.and(OWNER.ID.eq(owner.getId()));
        }

        return query.fetchOneInto(Long.class);
    }

    @Override
    public Collection<DataEntityDetailsDto> listDetailsByOddrns(final Collection<String> oddrns) {
        final DataEntityQueryConfig config = DataEntityQueryConfig.builder()
            .cteSelectConditions(singletonList(DATA_ENTITY.ODDRN.in(CollectionUtils.emptyIfNull(oddrns))))
            .build();

        return enrichDataEntityDimensionsDto(dataEntitySelect(config)
            .fetchStream()
            .map(this::mapDetailsRecord)
            .collect(toList()));
    }

    @Override
    public List<DataEntityDto> listDtosByOddrns(final Collection<String> oddrns, final boolean includeHollow) {
        if (CollectionUtils.isEmpty(oddrns)) {
            return emptyList();
        }

        final DataEntityQueryConfig config = DataEntityQueryConfig.builder()
            .cteSelectConditions(singletonList(DATA_ENTITY.ODDRN.in(oddrns)))
            .includeHollow(includeHollow)
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

    @Override
    public List<DataEntityDimensionsDto> listAllByOddrns(final Collection<String> oddrns,
                                                         final Integer page,
                                                         final Integer size,
                                                         final boolean skipHollow) {
        if (CollectionUtils.isEmpty(oddrns)) {
            return emptyList();
        }

        DataEntityQueryConfig.DataEntityQueryConfigBuilder configBuilder = DataEntityQueryConfig.builder()
            .cteSelectConditions(singletonList(DATA_ENTITY.ODDRN.in(oddrns)))
            .includeHollow(!skipHollow);

        if (page != null && size != null) {
            configBuilder = configBuilder.cteLimitOffset(
                new DataEntityQueryConfig.LimitOffset(size, (page - 1) * size));
        }

        return listByConfig(configBuilder.build());
    }

    @Override
    public List<DataEntityDimensionsDto> listByEntityClass(final int page,
                                                           final int size,
                                                           final int entityClassId,
                                                           final Integer typeId) {
        final List<Condition> cteSelectConditions = Stream
            .of(DATA_ENTITY.ENTITY_CLASS_IDS.contains(new Integer[] {entityClassId}),
                typeId != null ? DATA_ENTITY.TYPE_ID.eq(typeId) : null)
            .filter(Objects::nonNull)
            .collect(toList());

        final DataEntityQueryConfig config = DataEntityQueryConfig
            .builder()
            .cteSelectConditions(cteSelectConditions)
            .cteLimitOffset(new DataEntityQueryConfig.LimitOffset(size, (page - 1) * size))
            .build();

        return listByConfig(config);
    }

    @Override
    public List<DataEntityDimensionsDto> listByTerm(final long termId, final String query, final Integer entityClassId,
                                                    final int page, final int size) {
        final List<Condition> cteConditions = new ArrayList<>();
        if (entityClassId != null) {
            cteConditions.add(DATA_ENTITY.ENTITY_CLASS_IDS.contains(new Integer[] {entityClassId}));
        }
        DataEntityQueryConfig.DataEntityQueryConfigBuilder builder = DataEntityQueryConfig
            .builder()
            .cteSelectConditions(cteConditions)
            .selectConditions(List.of(DATA_ENTITY_TO_TERM.TERM_ID.eq(termId)));

        if (StringUtils.isNotEmpty(query)) {
            builder = builder.fts(
                new DataEntityQueryConfig.Fts(query));
        }
        final List<DataEntityDimensionsDto> entities = dataEntitySelect(builder.build())
            .limit(size)
            .offset((page - 1) * size)
            .fetchStream()
            .map(this::mapDimensionRecord)
            .toList();

        return enrichDataEntityDimensionsDto(entities);
    }

    @Override
    public List<DataEntityDto> listByOwner(final int page, final int size, final long ownerId) {
        final DataEntityQueryConfig config = DataEntityQueryConfig.builder()
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
    public List<String> listOddrnsByOwner(final long ownerId, final LineageStreamKind streamKind) {
        final DataEntityQueryConfig config = DataEntityQueryConfig.builder()
            .selectConditions(singletonList(OWNERSHIP.OWNER_ID.eq(ownerId)))
            .build();

        final Set<String> associatedOddrns = dataEntitySelect(config)
            .fetchStream()
            .map(r -> jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY).get(DATA_ENTITY.ODDRN))
            .collect(Collectors.toSet());

        return lineageRepository
            .getLineageRelations(associatedOddrns, LineageDepth.empty(), streamKind)
            .stream()
            .flatMap(lp -> Stream.of(lp.getParentOddrn(), lp.getChildOddrn()))
            .distinct()
            .filter(not(associatedOddrns::contains))
            .collect(toList());
    }

    @Override
    public List<? extends DataEntityDto> listPopular(final int page, final int size) {
        final DataEntityQueryConfig config = DataEntityQueryConfig.builder()
            .cteLimitOffset(new DataEntityQueryConfig.LimitOffset(size, (page - 1) * size))
            .orderBy(DATA_ENTITY.VIEW_COUNT.sort(SortOrder.DESC))
            .build();

        return listByConfig(config);
    }

    @Override
    @BlockingTransactional
    public Optional<DataEntityDetailsDto> getDetails(final long id) {
        final DataEntityQueryConfig config = DataEntityQueryConfig.builder()
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
        final DataEntityQueryConfig config = DataEntityQueryConfig
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
    @BlockingTransactional
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

        DataEntityQueryConfig.DataEntityQueryConfigBuilder builder = DataEntityQueryConfig
            .builder()
            .cteSelectConditions(conditionsPair.getLeft())
            .selectConditions(joinConditions);

        if (StringUtils.isNotEmpty(state.getQuery())) {
            builder = builder.fts(
                new DataEntityQueryConfig.Fts(state.getQuery()));
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
    public List<DataEntityDto> getQuerySuggestions(final String query, final Integer entityClassId,
                                                   final Boolean manuallyCreated) {
        if (StringUtils.isEmpty(query)) {
            return emptyList();
        }

        final List<Condition> conditions = new ArrayList<>();
        conditions.add(jooqFTSHelper.ftsCondition(SEARCH_ENTRYPOINT.SEARCH_VECTOR, query));
        conditions.add(DATA_ENTITY.HOLLOW.isFalse());
        conditions.add(DATA_ENTITY.DELETED_AT.isNull());
        if (entityClassId != null) {
            conditions.add(DATA_ENTITY.ENTITY_CLASS_IDS.contains(new Integer[] {entityClassId}));
        }
        if (manuallyCreated != null) {
            conditions.add(DATA_ENTITY.MANUALLY_CREATED.eq(manuallyCreated));
        }

        final Name deCteName = name(DATA_ENTITY_CTE_NAME);

        final Field<?> rankField = jooqFTSHelper.ftsRankField(SEARCH_ENTRYPOINT.SEARCH_VECTOR, query);

        final Select<Record> dataEntitySelect = dslContext
            .select(DATA_ENTITY.fields())
            .select(rankField.as(RANK_FIELD_ALIAS))
            .from(SEARCH_ENTRYPOINT)
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
            .where(conditions)
            .orderBy(RANK_FIELD_ALIAS.desc())
            .limit(SUGGESTION_LIMIT);

        final Table<Record> deCte = dataEntitySelect.asTable(deCteName);

        return dslContext.with(deCteName)
            .asMaterialized(dataEntitySelect)
            .select(deCte.fields())
            .select(hasAlerts(deCte))
            .from(deCteName)
            .groupBy(deCte.fields())
            .orderBy(jooqQueryHelper.getField(deCte, RANK_FIELD_ALIAS).desc())
            .fetchStream()
            .map(this::mapDtoRecord)
            .collect(toList());
    }

    private List<DataEntityDimensionsDto> listByConfig(final DataEntityQueryConfig config) {
        final List<DataEntityDimensionsDto> entities = dataEntitySelect(config)
            .fetchStream()
            .map(this::mapDimensionRecord)
            .toList();

        return enrichDataEntityDimensionsDto(entities);
    }

    private SelectLimitStep<Record> dataEntitySelect(final DataEntityQueryConfig config) {
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
                .select(jsonArrayAgg(field(TAG_TO_DATA_ENTITY.asterisk().toString())).as(AGG_TAGS_RELATION_FIELD))
                .select(jsonArrayAgg(field(TAG.asterisk().toString())).as(AGG_TAGS_FIELD))
                .select(jsonArrayAgg(field(OWNER.asterisk().toString())).as(AGG_OWNER_FIELD))
                .select(jsonArrayAgg(field(TITLE.asterisk().toString())).as(AGG_TITLE_FIELD))
                .select(jsonArrayAgg(field(OWNERSHIP.asterisk().toString())).as(AGG_OWNERSHIP_FIELD))
                .select(hasAlerts(deCte));
        }

        SelectJoinStep<Record> fromStep = selectStep.from(deCteName);

        if (config.isDimensions()) {
            fromStep = fromStep
                .leftJoin(DATA_SOURCE)
                .on(DATA_SOURCE.ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.DATA_SOURCE_ID)))
                .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.NAMESPACE_ID)))
                .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
                .leftJoin(TAG_TO_DATA_ENTITY)
                .on(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID)))
                .leftJoin(TAG).on(TAG.ID.eq(TAG_TO_DATA_ENTITY.TAG_ID))
                .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID)))
                .leftJoin(OWNER).on(OWNER.ID.eq(OWNERSHIP.OWNER_ID))
                .leftJoin(TITLE).on(TITLE.ID.eq(OWNERSHIP.TITLE_ID))
                .leftJoin(DATA_ENTITY_TO_TERM)
                .on(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID)))
                .and(DATA_ENTITY_TO_TERM.DELETED_AT.isNull());
        }

        final SelectHavingStep<Record> groupByStep = fromStep
            .where(ListUtils.emptyIfNull(config.getSelectConditions()))
            .groupBy(selectFields);

        final List<OrderField<?>> orderFields = new ArrayList<>();
        if (config.getFts() != null) {
            orderFields.add(jooqQueryHelper.getField(deCte, config.getFts().rankFieldAlias()).desc());
        }
        orderFields.add(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID).desc());

        return groupByStep.orderBy(orderFields);
    }

    private Field<Boolean> hasAlerts(final Table<Record> deCte) {
        return field(exists(dslContext.selectOne().from(ALERT)
            .where(ALERT.DATA_ENTITY_ODDRN.eq(deCte.field(DATA_ENTITY.ODDRN)))
            .and(ALERT.STATUS.eq(AlertStatusEnum.OPEN.toString())))).as(HAS_ALERTS_FIELD);
    }

    private void enrichDatasetVersions(final DataEntityDetailsDto dto) {
        if (!ArrayUtils.contains(dto.getDataEntity().getEntityClassIds(), DataEntityClassDto.DATA_SET.getId())) {
            return;
        }

        final List<DatasetVersionPojo> versions = datasetVersionRepository.getVersions(dto.getDataEntity().getOddrn());

        dto.setDatasetVersions(versions);
    }

    private void enrichDetailsWithMetadata(final DataEntityDetailsDto dto) {
        dto.setMetadata(metadataFieldValueRepository.getDtosByDataEntityId(dto.getDataEntity().getId()));
    }

    private void enrichDetailsWithTerms(final DataEntityDetailsDto dto) {
        dto.setTerms(termRepository.findTermsByDataEntityId(dto.getDataEntity().getId()));
    }

    private <T extends DataEntityDimensionsDto> void enrichDEGDetails(final T dto) {
        if (!ArrayUtils.contains(dto.getDataEntity().getEntityClassIds(),
            DataEntityClassDto.DATA_ENTITY_GROUP.getId())) {
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
            .filter(d -> ArrayUtils.contains(d.getEntityClassIds(), DataEntityClassDto.DATA_ENTITY_GROUP.getId()))
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
            .select(count(GROUP_PARENT_GROUP_RELATIONS.GROUP_ODDRN).cast(Long.class).as(childrenCountField))
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
        enrichDetailsWithTerms(dto);
        return dto;
    }

    private <T extends DataEntityDimensionsDto> T enrichDataEntityDimensionsDto(final T dto) {
        final Set<String> deps = dto.getSpecificAttributes().values().stream()
            .map(DataEntityAttributes::getDependentOddrns)
            .flatMap(Set::stream)
            .collect(Collectors.toSet());

        final Map<String, DataEntityDto> depsRepository = listDtosByOddrns(deps, false)
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

        final Map<String, DataEntityDto> depsRepository = listDtosByOddrns(deps, false)
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
                case DATA_SET -> {
                    final DataSetAttributes dsa = (DataSetAttributes) attrs;
                    dto.setDataSetDetailsDto(new DataEntityDetailsDto.DataSetDetailsDto(
                        dsa.getRowsCount(),
                        dsa.getFieldsCount(),
                        dsa.getConsumersCount()
                    ));
                }
                case DATA_TRANSFORMER -> {
                    final DataTransformerAttributes dta = (DataTransformerAttributes) attrs;
                    final DataTransformerDetailsDto dataTransformerDetailsDto =
                        new DataTransformerDetailsDto(fetcher.apply(dta.getSourceOddrnList()),
                            fetcher.apply(dta.getTargetOddrnList()),
                            dta.getSourceCodeUrl());
                    dto.setDataTransformerDetailsDto(dataTransformerDetailsDto);
                }
                case DATA_QUALITY_TEST -> {
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
                }
                case DATA_CONSUMER -> {
                    final DataConsumerAttributes dca = (DataConsumerAttributes) attrs;
                    dto.setDataConsumerDetailsDto(new DataConsumerDetailsDto(fetcher.apply(dca.getInputListOddrn())));
                }
                case DATA_INPUT -> {
                    final DataInputAttributes dia = (DataInputAttributes) attrs;
                    dto.setDataInputDetailsDto(new DataInputDetailsDto(fetcher.apply(dia.getOutputListOddrn())));
                }
                default -> {
                }
            }
        });
    }

    private DataEntityDto mapDtoRecord(final Record r) {
        final Record deRecord = jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY);

        final DataEntityPojo dataEntity = jooqRecordHelper.extractRelation(deRecord, DATA_ENTITY, DataEntityPojo.class);

        return DataEntityDto.builder()
            .dataEntity(dataEntity)
            .hasAlerts(r.get(field(HAS_ALERTS_FIELD), Boolean.TYPE))
            .specificAttributes(extractSpecificAttributes(dataEntity))
            .build();
    }

    private DataEntityDimensionsDto mapDimensionRecord(final Record r) {
        final Record deRecord = jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY);
        final DataEntityPojo dataEntity = jooqRecordHelper.extractRelation(deRecord, DATA_ENTITY, DataEntityPojo.class);

        return DataEntityDimensionsDto.dimensionsBuilder()
            .dataEntity(dataEntity)
            .hasAlerts(r.get(field(HAS_ALERTS_FIELD), Boolean.TYPE))
            .dataSource(jooqRecordHelper.extractRelation(r, DATA_SOURCE, DataSourcePojo.class))
            .specificAttributes(extractSpecificAttributes(dataEntity))
            .namespace(jooqRecordHelper.extractRelation(r, NAMESPACE, NamespacePojo.class))
            .ownership(extractOwnershipRelation(r))
            .tags(extractTags(r))
            .build();
    }

    private DataEntityDetailsDto mapDetailsRecord(final Record r) {
        final Record deRecord = jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY);
        final DataEntityPojo dataEntity = jooqRecordHelper.extractRelation(deRecord, DATA_ENTITY, DataEntityPojo.class);

        return DataEntityDetailsDto.detailsBuilder()
            .dataEntity(dataEntity)
            .hasAlerts(r.get(field(HAS_ALERTS_FIELD), Boolean.TYPE))
            .dataSource(jooqRecordHelper.extractRelation(r, DATA_SOURCE, DataSourcePojo.class))
            .specificAttributes(extractSpecificAttributes(dataEntity))
            .namespace(jooqRecordHelper.extractRelation(r, NAMESPACE, NamespacePojo.class))
            .ownership(extractOwnershipRelation(r))
            .tags(extractTags(r))
            .build();
    }

    private List<TagDto> extractTags(final Record r) {
        final Set<TagPojo> tagPojos = jooqRecordHelper.extractAggRelation(r, AGG_TAGS_FIELD, TagPojo.class);
        final Map<Long, TagToDataEntityPojo> tagRelations = jooqRecordHelper.extractAggRelation(r,
                AGG_TAGS_RELATION_FIELD, TagToDataEntityPojo.class).stream()
            .collect(Collectors.toMap(TagToDataEntityPojo::getTagId, identity()));
        return tagPojos.stream()
            .map(pojo -> new TagDto(pojo, null, tagRelations.get(pojo.getId()).getExternal()))
            .toList();
    }

    private List<OwnershipDto> extractOwnershipRelation(final Record r) {
        final Map<Long, OwnerPojo> ownerDict = jooqRecordHelper.extractAggRelation(r, AGG_OWNER_FIELD, OwnerPojo.class)
            .stream()
            .collect(Collectors.toMap(OwnerPojo::getId, identity()));

        final Map<Long, TitlePojo> titleDict = jooqRecordHelper.extractAggRelation(r, AGG_TITLE_FIELD, TitlePojo.class)
            .stream()
            .collect(Collectors.toMap(TitlePojo::getId, identity()));

        return jooqRecordHelper.extractAggRelation(r, AGG_OWNERSHIP_FIELD, OwnershipPojo.class)
            .stream()
            .map(os -> {
                final OwnerPojo owner = ownerDict.get(os.getOwnerId());
                if (owner == null) {
                    throw new IllegalArgumentException(
                        String.format("There's no owner with id %s found in ownerDict", os.getOwnerId()));
                }

                final TitlePojo title = titleDict.get(os.getTitleId());
                if (title == null) {
                    throw new IllegalArgumentException(
                        String.format("There's no title with id %s found in titleDict", os.getTitleId()));
                }

                return OwnershipDto.builder()
                    .ownership(os)
                    .owner(owner)
                    .title(title)
                    .build();
            })
            .collect(toList());
    }

    private Map<DataEntityClassDto, DataEntityAttributes> extractSpecificAttributes(final DataEntityPojo dataEntity
    ) {
        if (dataEntity.getHollow() || dataEntity.getSpecificAttributes() == null) {
            return emptyMap();
        }

        final Map<String, ?> specificAttributes = JSONSerDeUtils.deserializeJson(
            dataEntity.getSpecificAttributes().data(),
            SPECIFIC_ATTRIBUTES_TYPE_REFERENCE
        );

        return DataEntityClassDto.findByIds(dataEntity.getEntityClassIds())
            .stream()
            .map(t -> Pair.of(t, JSONSerDeUtils.deserializeJson(
                specificAttributes.get(t.toString()),
                DataEntityAttributes.TYPE_TO_ATTR_CLASS.get(t)
            )))
            .filter(p -> p.getRight() != null)
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));
    }

    private Select<Record> cteDataEntitySelect(final DataEntityQueryConfig config) {
        Select<Record> dataEntitySelect;

        final List<OrderField<?>> orderFields = new ArrayList<>();

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
                .and(jooqFTSHelper.ftsCondition(SEARCH_ENTRYPOINT.SEARCH_VECTOR, config.getFts().query()))
                .and(DATA_ENTITY.DELETED_AT.isNull());
        } else {
            dataEntitySelect = dslContext.select(DATA_ENTITY.fields())
                .from(DATA_ENTITY)
                .where(ListUtils.emptyIfNull(config.getCteSelectConditions()))
                .and(DATA_ENTITY.DELETED_AT.isNull());
        }

        if (!config.isIncludeHollow()) {
            dataEntitySelect = ((SelectConditionStep<Record>) dataEntitySelect)
                .and(DATA_ENTITY.HOLLOW.isFalse());
        }

        if (config.getOrderBy() != null) {
            orderFields.add(config.getOrderBy());
        }

        orderFields.add(DATA_ENTITY.ID.desc());

        dataEntitySelect = ((SelectConditionStep<Record>) dataEntitySelect).orderBy(orderFields);

        if (config.getCteLimitOffset() != null) {
            dataEntitySelect = ((SelectConditionStep<Record>) dataEntitySelect)
                .limit(config.getCteLimitOffset().limit())
                .offset(config.getCteLimitOffset().offset());
        }

        return dataEntitySelect;
    }
}
