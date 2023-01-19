package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.ListUtils;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Name;
import org.jooq.OrderField;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityRecord;
import org.opendatadiscovery.oddplatform.repository.mapper.DataEntityDtoMapper;
import org.opendatadiscovery.oddplatform.repository.util.DataEntityCTEQueryConfig;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.count;
import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.jooq.impl.DSL.name;
import static org.opendatadiscovery.oddplatform.model.Tables.ALERT;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_ENTITY_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_PARENT_GROUP_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD_VALUE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.TITLE;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityCTEQueryConfig.AGG_METADATA_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityCTEQueryConfig.AGG_METADATA_VALUE_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityCTEQueryConfig.AGG_OWNERSHIP_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityCTEQueryConfig.AGG_OWNER_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityCTEQueryConfig.AGG_TAGS_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityCTEQueryConfig.AGG_TAGS_RELATION_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityCTEQueryConfig.AGG_TITLE_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityCTEQueryConfig.DATA_ENTITY_CTE_NAME;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityCTEQueryConfig.HAS_ALERTS_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.DATA_ENTITY_CONDITIONS;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.RANK_FIELD_ALIAS;

@Repository
public class ReactiveDataEntityRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<DataEntityRecord, DataEntityPojo>
    implements ReactiveDataEntityRepository {
    private static final int SUGGESTION_LIMIT = 5;
    private final JooqFTSHelper jooqFTSHelper;
    private final JooqRecordHelper jooqRecordHelper;
    private final DataEntityDtoMapper dataEntityDtoMapper;

    public ReactiveDataEntityRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                            final JooqQueryHelper jooqQueryHelper,
                                            final JooqRecordHelper jooqRecordHelper,
                                            final JooqFTSHelper jooqFTSHelper,
                                            final DataEntityDtoMapper dataEntityDtoMapper) {
        super(jooqReactiveOperations, jooqQueryHelper, DATA_ENTITY, DataEntityPojo.class, DATA_ENTITY.EXTERNAL_NAME,
            DATA_ENTITY.ID, DATA_ENTITY.CREATED_AT, DATA_ENTITY.UPDATED_AT, DATA_ENTITY.DELETED_AT);
        this.jooqFTSHelper = jooqFTSHelper;
        this.jooqRecordHelper = jooqRecordHelper;
        this.dataEntityDtoMapper = dataEntityDtoMapper;
    }

    @Override
    public Flux<DataEntityPojo> get(final List<Long> ids) {
        return jooqReactiveOperations.flux(DSL.selectFrom(DATA_ENTITY).where(idCondition(ids))).map(this::recordToPojo);
    }

    @Override
    public Mono<Boolean> exists(final long dataEntityId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(DATA_ENTITY).where(addSoftDeleteFilter(DATA_ENTITY.ID.eq(dataEntityId))));

        return jooqReactiveOperations.mono(query).map(Record1::component1).defaultIfEmpty(false);
    }

    @Override
    public Mono<Boolean> existsByDataSourceId(final long dataSourceId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(DATA_ENTITY).where(addSoftDeleteFilter(DATA_ENTITY.DATA_SOURCE_ID.eq(dataSourceId))));

        return jooqReactiveOperations.mono(query).map(Record1::component1).defaultIfEmpty(false);
    }

    @Override
    public Mono<Boolean> existsByNamespaceId(final long namespaceId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(DATA_ENTITY).where(addSoftDeleteFilter(DATA_ENTITY.NAMESPACE_ID.eq(namespaceId))));

        return jooqReactiveOperations.mono(query).map(Record1::component1).defaultIfEmpty(false);
    }

    @Override
    public Mono<Long> incrementViewCount(final long id) {
        final var query = DSL.update(DATA_ENTITY)
            .set(DATA_ENTITY.VIEW_COUNT, DATA_ENTITY.VIEW_COUNT.plus(1))
            .where(DATA_ENTITY.ID.eq(id))
            .returningResult(DATA_ENTITY.VIEW_COUNT);
        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    @Override
    public Mono<DataEntityDimensionsDto> getDimensions(final long id) {
        final DataEntityCTEQueryConfig cteConfig = DataEntityCTEQueryConfig.builder()
            .conditions(List.of(DATA_ENTITY.ID.eq(id)))
            .build();
        final var query = baseDimensionsSelect(cteConfig);
        return jooqReactiveOperations.mono(query)
            .map(dataEntityDtoMapper::mapDimensionRecord);
    }

    @Override
    public Mono<List<DataEntityDimensionsDto>> getDimensions(final Collection<String> oddrns) {
        final DataEntityCTEQueryConfig cteConfig = DataEntityCTEQueryConfig.builder()
            .conditions(List.of(DATA_ENTITY.ODDRN.in(oddrns)))
            .build();
        final var query = baseDimensionsSelect(cteConfig);
        return jooqReactiveOperations.flux(query)
            .map(dataEntityDtoMapper::mapDimensionRecord)
            .collectList();
    }

    @Override
    public Mono<DataEntityDetailsDto> getDetails(final long id) {
        final DataEntityCTEQueryConfig cteConfig = DataEntityCTEQueryConfig.builder()
            .conditions(List.of(DATA_ENTITY.ID.eq(id)))
            .build();
        final var query = baseDimensionsSelect(cteConfig);
        return jooqReactiveOperations.mono(query)
            .map(dataEntityDtoMapper::mapDetailsRecord);
    }

    @Override
    public Flux<DataEntityPojo> listAllByOddrns(final Collection<String> oddrns,
                                                final boolean includeHollow,
                                                final Integer page,
                                                final Integer size) {
        if (CollectionUtils.isEmpty(oddrns)) {
            return Flux.just();
        }
        final List<Condition> conditions = new ArrayList<>(addSoftDeleteFilter(DATA_ENTITY.ODDRN.in(oddrns)));
        if (!includeHollow) {
            conditions.add(DATA_ENTITY.HOLLOW.eq(false));
        }

        final var query = DSL.selectFrom(DATA_ENTITY)
            .where(conditions)
            .limit(size != null ? DSL.val(size) : DSL.noField(Integer.class))
            .offset(page != null && size != null ? DSL.val((page - 1) * size) : DSL.noField(Integer.class));

        return jooqReactiveOperations.flux(query).map(r -> r.into(DataEntityPojo.class));
    }

    @Override
    public Mono<DataEntityDimensionsDto> getDataEntityWithDataSourceAndNamespace(final long dataEntityId) {
        final List<Condition> conditions = addSoftDeleteFilter(DATA_ENTITY.ID.eq(dataEntityId));
        final Select<Record> query = baseDataEntityWithDatasourceAndNamespaceSelect(conditions);
        return jooqReactiveOperations.mono(query)
            .map(r -> DataEntityDimensionsDto.dimensionsBuilder()
                .dataEntity(r.into(DATA_ENTITY).into(DataEntityPojo.class))
                .dataSource(r.into(DATA_SOURCE).into(DataSourcePojo.class))
                .namespace(r.into(NAMESPACE).into(NamespacePojo.class))
                .build());
    }

    @Override
    public Flux<DataEntityDimensionsDto> getDataEntitiesWithDataSourceAndNamespace(final Collection<String> oddrns) {
        final List<Condition> conditions = addSoftDeleteFilter(DATA_ENTITY.ODDRN.in(oddrns));
        final Select<Record> query = baseDataEntityWithDatasourceAndNamespaceSelect(conditions);
        return jooqReactiveOperations.flux(query)
            .map(r -> DataEntityDimensionsDto.dimensionsBuilder()
                .dataEntity(r.into(DATA_ENTITY).into(DataEntityPojo.class))
                .dataSource(r.into(DATA_SOURCE).into(DataSourcePojo.class))
                .namespace(r.into(NAMESPACE).into(NamespacePojo.class))
                .build());
    }

    @Override
    public Mono<List<DataEntityPojo>> getDEGEntities(final String groupOddrn) {
        final SelectConditionStep<Record> query = DSL.select(DATA_ENTITY.fields())
            .from(GROUP_ENTITY_RELATIONS)
            .leftJoin(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN))
            .where(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(groupOddrn));
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(DataEntityPojo.class))
            .collectList();
    }

    @Override
    public Mono<Map<String, Set<DataEntityPojo>>> getDEGEntities(final Collection<String> groupOddrns) {
        final String dataEntityFields = "data_entity_agg";
        final var query = DSL.select(GROUP_ENTITY_RELATIONS.GROUP_ODDRN)
            .select(jsonArrayAgg(field(DATA_ENTITY.asterisk().toString())).as(dataEntityFields))
            .from(GROUP_ENTITY_RELATIONS)
            .leftJoin(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN))
            .where(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.in(groupOddrns))
            .groupBy(GROUP_ENTITY_RELATIONS.GROUP_ODDRN);
        return jooqReactiveOperations.flux(query).collectMap(
            r -> r.get(GROUP_ENTITY_RELATIONS.GROUP_ODDRN),
            r -> jooqRecordHelper.extractAggRelation(r, dataEntityFields, DataEntityPojo.class)
        );
    }

    @Override
    public Mono<List<DataEntityDimensionsDto>> getDEGExperimentRuns(final Long dataEntityGroupId,
                                                                    final Integer page,
                                                                    final Integer size) {
        final Name deCteName = name(DATA_ENTITY_CTE_NAME);
        final DataEntityCTEQueryConfig cteConfig = DataEntityCTEQueryConfig.builder().build();
        final Select<Record> dataEntitySelect = cteDataEntitySelect(cteConfig);
        final Table<Record> deCte = dataEntitySelect.asTable(deCteName);

        final List<Field<?>> groupByFields = Stream.of(deCte.fields(), NAMESPACE.fields(), DATA_SOURCE.fields())
            .flatMap(Arrays::stream)
            .toList();

        final List<Field<?>> aggregatedFields = List.of(
            jsonArrayAgg(field(OWNER.asterisk().toString())).as(AGG_OWNER_FIELD),
            jsonArrayAgg(field(TITLE.asterisk().toString())).as(AGG_TITLE_FIELD),
            jsonArrayAgg(field(OWNERSHIP.asterisk().toString())).as(AGG_OWNERSHIP_FIELD),
            hasAlerts(deCte));

        final Table<?> fromTable = DSL.table(deCteName)
            .leftJoin(DATA_SOURCE)
            .on(DATA_SOURCE.ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.DATA_SOURCE_ID)))
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.NAMESPACE_ID)))
            .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID)))
            .leftJoin(OWNER).on(OWNER.ID.eq(OWNERSHIP.OWNER_ID))
            .leftJoin(TITLE).on(TITLE.ID.eq(OWNERSHIP.TITLE_ID))
            .leftJoin(GROUP_PARENT_GROUP_RELATIONS)
            .on(GROUP_PARENT_GROUP_RELATIONS.GROUP_ODDRN.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ODDRN)));

        final var dataEntityGroupOddrn = DSL.select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .where(DATA_ENTITY.ID.eq(dataEntityGroupId));
        final List<Condition> conditions = List.of(
            GROUP_PARENT_GROUP_RELATIONS.PARENT_GROUP_ODDRN.eq(dataEntityGroupOddrn));

        final var query = DSL.with(deCteName)
            .asMaterialized(dataEntitySelect)
            .select(groupByFields)
            .select(aggregatedFields)
            .from(fromTable)
            .where(conditions)
            .groupBy(groupByFields)
            .orderBy(getOrderFields(cteConfig, deCte))
            .limit(size)
            .offset((page - 1) * size);

        return jooqReactiveOperations.flux(query)
            .map(dataEntityDtoMapper::mapDimensionRecord)
            .collectList();
    }

    @Override
    public Mono<Map<String, Long>> getChildrenCount(final Collection<String> groupOddrns) {
        final Field<Long> childrenCountField = field("children_count", Long.class);
        final var query = DSL.select(GROUP_PARENT_GROUP_RELATIONS.PARENT_GROUP_ODDRN)
            .select(count(GROUP_PARENT_GROUP_RELATIONS.GROUP_ODDRN).cast(Long.class).as(childrenCountField))
            .from(GROUP_PARENT_GROUP_RELATIONS)
            .where(GROUP_PARENT_GROUP_RELATIONS.PARENT_GROUP_ODDRN.in(groupOddrns))
            .groupBy(GROUP_PARENT_GROUP_RELATIONS.PARENT_GROUP_ODDRN);
        return jooqReactiveOperations.flux(query).collectMap(
            r -> r.get(GROUP_PARENT_GROUP_RELATIONS.PARENT_GROUP_ODDRN),
            r -> r.get(childrenCountField)
        );
    }

    @Override
    public Mono<Void> createHollow(final Collection<String> hollowOddrns) {
        return insertMany(hollowOddrns.stream().map(this::buildHollowRecord).toList(), false);
    }

    @Override
    public Mono<DataEntityPojo> setInternalName(final long dataEntityId, final String name) {
        final String newBusinessName = StringUtils.isEmpty(name) ? null : name;
        final var query = DSL.update(DATA_ENTITY)
            .set(DATA_ENTITY.INTERNAL_NAME, newBusinessName)
            .set(DATA_ENTITY.UPDATED_AT, LocalDateTime.now())
            .where(DATA_ENTITY.ID.eq(dataEntityId))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityPojo.class));
    }

    @Override
    public Mono<DataEntityPojo> setInternalDescription(final long dataEntityId, final String description) {
        final String newDescription = StringUtils.isEmpty(description) ? null : description;
        final var query = DSL.update(DATA_ENTITY)
            .set(DATA_ENTITY.INTERNAL_DESCRIPTION, newDescription)
            .set(DATA_ENTITY.UPDATED_AT, LocalDateTime.now())
            .where(DATA_ENTITY.ID.eq(dataEntityId))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityPojo.class));
    }

    @Override
    public Mono<Long> countByState(final FacetStateDto state, final OwnerPojo owner) {
        final List<Condition> conditions = new ArrayList<>(jooqFTSHelper
            .facetStateConditions(state, DATA_ENTITY_CONDITIONS, List.of(FacetType.ENTITY_CLASSES)));
        conditions.add(DATA_ENTITY.HOLLOW.isFalse());
        conditions.add(DATA_ENTITY.DELETED_AT.isNull());
        conditions.add(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()));
        if (StringUtils.isNotEmpty(state.getQuery())) {
            conditions.add(jooqFTSHelper.ftsCondition(SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
        }
        if (owner != null) {
            conditions.add(OWNER.ID.eq(owner.getId()));
        }

        final var select = DSL.select(countDistinct(DATA_ENTITY.ID))
            .from(DATA_ENTITY)
            .join(SEARCH_ENTRYPOINT).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_ENTITY.NAMESPACE_ID))
            .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(GROUP_ENTITY_RELATIONS).on(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(DATA_ENTITY.ODDRN))
            .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(OWNER).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID));
        select.where(conditions);

        return jooqReactiveOperations.mono(select).map(r -> r.value1().longValue());
    }

    @Override
    public Flux<DataEntityDto> getQuerySuggestions(final String query,
                                                   final Integer entityClassId,
                                                   final Boolean manuallyCreated) {
        if (StringUtils.isEmpty(query)) {
            return Flux.empty();
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

        final Select<Record> cteSelect = DSL
            .select(DATA_ENTITY.fields())
            .select(rankField.as(RANK_FIELD_ALIAS))
            .from(SEARCH_ENTRYPOINT)
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
            .where(conditions)
            .orderBy(RANK_FIELD_ALIAS.desc())
            .limit(SUGGESTION_LIMIT);

        final Table<Record> deCte = cteSelect.asTable(deCteName);

        final var select = DSL.with(deCteName)
            .asMaterialized(cteSelect)
            .select(deCte.fields())
            .select(hasAlerts(deCte))
            .from(deCteName)
            .groupBy(deCte.fields())
            .orderBy(jooqQueryHelper.getField(deCte, RANK_FIELD_ALIAS).desc());

        return jooqReactiveOperations.flux(select)
            .map(dataEntityDtoMapper::mapDtoRecordFromCTE);
    }

    @Override
    public Flux<DataEntityDto> listByOwner(final long ownerId, final Integer page, final Integer size) {
        final Name deCteName = name(DATA_ENTITY_CTE_NAME);
        final Select<Record> dataEntitySelect = cteDataEntitySelect(DataEntityCTEQueryConfig.builder().build());
        final Table<Record> deCte = dataEntitySelect.asTable(deCteName);

        final var select = DSL.with(deCteName)
            .as(dataEntitySelect)
            .select(deCte.fields())
            .select(hasAlerts(deCte))
            .from(deCteName)
            .join(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(deCte.field(DATA_ENTITY.ID)))
            .where(OWNERSHIP.OWNER_ID.eq(ownerId))
            .orderBy(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID).desc())
            .limit(size != null ? DSL.val(size) : DSL.noField(Integer.class))
            .offset(page != null && size != null ? DSL.val((page - 1) * size) : DSL.noField(Integer.class));

        return jooqReactiveOperations.flux(select)
            .map(dataEntityDtoMapper::mapDtoRecordFromCTE);
    }

    @Override
    public Flux<DataEntityDimensionsDto> listByTerm(final long termId,
                                                    final String queryString,
                                                    final Integer entityClassId,
                                                    final int page,
                                                    final int size) {
        final List<Condition> cteConditions = new ArrayList<>();
        if (entityClassId != null) {
            cteConditions.add(DATA_ENTITY.ENTITY_CLASS_IDS.contains(new Integer[] {entityClassId}));
        }
        final var builder = DataEntityCTEQueryConfig.builder()
            .conditions(cteConditions);

        if (StringUtils.isNotEmpty(queryString)) {
            builder.fts(new DataEntityCTEQueryConfig.Fts(queryString));
        }

        final DataEntityCTEQueryConfig cteConfig = builder.build();

        final Name deCteName = name(DATA_ENTITY_CTE_NAME);
        final Select<Record> dataEntitySelect = cteDataEntitySelect(cteConfig);
        final Table<Record> deCte = dataEntitySelect.asTable(deCteName);

        final List<Field<?>> groupByFields = Stream.of(deCte.fields(), NAMESPACE.fields(), DATA_SOURCE.fields())
            .flatMap(Arrays::stream)
            .toList();

        final List<Field<?>> aggregatedFields = List.of(
            jsonArrayAgg(field(OWNER.asterisk().toString())).as(AGG_OWNER_FIELD),
            jsonArrayAgg(field(TITLE.asterisk().toString())).as(AGG_TITLE_FIELD),
            jsonArrayAgg(field(OWNERSHIP.asterisk().toString())).as(AGG_OWNERSHIP_FIELD),
            hasAlerts(deCte));

        final Table<?> fromTable = DSL.table(deCteName)
            .leftJoin(DATA_SOURCE)
            .on(DATA_SOURCE.ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.DATA_SOURCE_ID)))
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.NAMESPACE_ID)))
            .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID)))
            .leftJoin(OWNER).on(OWNER.ID.eq(OWNERSHIP.OWNER_ID))
            .leftJoin(TITLE).on(TITLE.ID.eq(OWNERSHIP.TITLE_ID))
            .leftJoin(DATA_ENTITY_TO_TERM)
            .on(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID)))
            .and(DATA_ENTITY_TO_TERM.DELETED_AT.isNull());

        final var query = DSL.with(deCteName)
            .asMaterialized(dataEntitySelect)
            .select(groupByFields)
            .select(aggregatedFields)
            .from(fromTable)
            .where(DATA_ENTITY_TO_TERM.TERM_ID.eq(termId))
            .groupBy(groupByFields)
            .orderBy(getOrderFields(cteConfig, deCte))
            .limit(size)
            .offset((page - 1) * size);
        return jooqReactiveOperations.flux(query)
            .map(dataEntityDtoMapper::mapDimensionRecord);
    }

    @Override
    public Flux<DataEntityDto> listPopular(final int page, final int size) {
        final DataEntityCTEQueryConfig cteConfig = DataEntityCTEQueryConfig.builder()
            .limitOffset(new DataEntityCTEQueryConfig.LimitOffset(size, (page - 1) * size))
            .orderBy(DATA_ENTITY.VIEW_COUNT.sort(SortOrder.DESC))
            .build();

        final Name deCteName = name(DATA_ENTITY_CTE_NAME);
        final Select<Record> dataEntitySelect = cteDataEntitySelect(cteConfig);
        final Table<Record> deCte = dataEntitySelect.asTable(deCteName);

        final var select = DSL.with(deCteName)
            .as(dataEntitySelect)
            .select(deCte.fields())
            .select(hasAlerts(deCte))
            .from(deCteName)
            .orderBy(getOrderFields(cteConfig, deCte));

        return jooqReactiveOperations.flux(select)
            .map(dataEntityDtoMapper::mapDtoRecordFromCTE);
    }

    @Override
    public Mono<List<DataEntityDimensionsDto>> findByState(final FacetStateDto state,
                                                           final int page,
                                                           final int size,
                                                           final OwnerPojo owner) {
        final Pair<List<Condition>, List<Condition>> conditionsPair = jooqFTSHelper.resultFacetStateConditions(state);
        final var builder = DataEntityCTEQueryConfig.builder()
            .conditions(conditionsPair.getLeft());
        if (StringUtils.isNotEmpty(state.getQuery())) {
            builder.fts(new DataEntityCTEQueryConfig.Fts(state.getQuery()));
        }
        final DataEntityCTEQueryConfig cteConfig = builder.build();

        final Name deCteName = name(DATA_ENTITY_CTE_NAME);
        final Select<Record> dataEntitySelect = cteDataEntitySelect(cteConfig);
        final Table<Record> deCte = dataEntitySelect.asTable(deCteName);

        final List<Condition> conditions = new ArrayList<>(conditionsPair.getRight());
        if (owner != null) {
            conditions.add(OWNER.ID.eq(owner.getId()));
        }

        final List<Field<?>> groupByFields = Stream.of(deCte.fields(), NAMESPACE.fields(), DATA_SOURCE.fields())
            .flatMap(Arrays::stream)
            .toList();

        final List<Field<?>> aggregatedFields = List.of(
            jsonArrayAgg(field(OWNER.asterisk().toString())).as(AGG_OWNER_FIELD),
            jsonArrayAgg(field(TITLE.asterisk().toString())).as(AGG_TITLE_FIELD),
            jsonArrayAgg(field(OWNERSHIP.asterisk().toString())).as(AGG_OWNERSHIP_FIELD),
            hasAlerts(deCte));

        final Table<?> fromTable = DSL.table(deCteName)
            .leftJoin(DATA_SOURCE)
            .on(DATA_SOURCE.ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.DATA_SOURCE_ID)))
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.NAMESPACE_ID)))
            .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(TAG_TO_DATA_ENTITY)
            .on(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID)))
            .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID)))
            .leftJoin(OWNER).on(OWNER.ID.eq(OWNERSHIP.OWNER_ID))
            .leftJoin(TITLE).on(TITLE.ID.eq(OWNERSHIP.TITLE_ID))
            .leftJoin(DATA_ENTITY_TO_TERM)
            .on(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID)))
            .and(DATA_ENTITY_TO_TERM.DELETED_AT.isNull())
            .leftJoin(GROUP_ENTITY_RELATIONS)
            .on(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ODDRN)));

        final var query = DSL.with(deCteName)
            .asMaterialized(dataEntitySelect)
            .select(groupByFields)
            .select(aggregatedFields)
            .from(fromTable)
            .where(conditions)
            .groupBy(groupByFields)
            .orderBy(getOrderFields(cteConfig, deCte))
            .limit(DSL.val(size))
            .offset(DSL.val((page - 1) * size));

        return jooqReactiveOperations.flux(query)
            .map(dataEntityDtoMapper::mapDimensionRecord)
            .collectList();
    }

    @Override
    public Mono<Map<String, Set<DataEntityPojo>>> getParentDEGs(final Collection<String> oddrns) {
        final Field<String> degOddrnField = field("deg_oddrn", String.class);
        final String cteName = "cte";
        final String dataEntityFields = "data_entity_agg";

        final var cteSelect = DSL.select(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN)
            .select(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.as(degOddrnField))
            .from(GROUP_ENTITY_RELATIONS)
            .where(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.in(oddrns))
            .union(DSL.select(GROUP_PARENT_GROUP_RELATIONS.PARENT_GROUP_ODDRN)
                .select(GROUP_PARENT_GROUP_RELATIONS.GROUP_ODDRN.as(degOddrnField))
                .from(GROUP_PARENT_GROUP_RELATIONS)
                .where(GROUP_PARENT_GROUP_RELATIONS.GROUP_ODDRN.in(oddrns)));

        final Table<Record> selectTable = cteSelect.asTable(cteName);
        final Field<String> deOddrnField =
            jooqQueryHelper.getField(selectTable, GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN);

        final var query = DSL.with(cteName)
            .as(cteSelect)
            .select(deOddrnField)
            .select(jsonArrayAgg(field(DATA_ENTITY.asterisk().toString())).as(dataEntityFields))
            .from(cteName)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(jooqQueryHelper.getField(selectTable, degOddrnField)))
            .groupBy(deOddrnField);
        return jooqReactiveOperations.flux(query).collectMap(
            r -> r.get(deOddrnField),
            r -> jooqRecordHelper.extractAggRelation(r, dataEntityFields, DataEntityPojo.class)
        );
    }

    @Override
    public Mono<DataEntityDetailsDto> getDataEntitySearchFields(final long dataEntityId) {
        final List<Field<?>> groupByFields = Stream.of(DATA_ENTITY.fields(), NAMESPACE.fields(), DATA_SOURCE.fields())
            .flatMap(Arrays::stream)
            .toList();

        final List<Field<?>> aggregatedFields = List.of(
            jsonArrayAgg(field(OWNER.asterisk().toString())).as(AGG_OWNER_FIELD),
            jsonArrayAgg(field(TITLE.asterisk().toString())).as(AGG_TITLE_FIELD),
            jsonArrayAgg(field(OWNERSHIP.asterisk().toString())).as(AGG_OWNERSHIP_FIELD),
            jsonArrayAgg(field(TAG_TO_DATA_ENTITY.asterisk().toString())).as(AGG_TAGS_RELATION_FIELD),
            jsonArrayAgg(field(TAG.asterisk().toString())).as(AGG_TAGS_FIELD),
            jsonArrayAgg(field(METADATA_FIELD.asterisk().toString())).as(AGG_METADATA_FIELD),
            jsonArrayAgg(field(METADATA_FIELD_VALUE.asterisk().toString())).as(AGG_METADATA_VALUE_FIELD)
        );

        final var query = DSL.select(groupByFields)
            .select(aggregatedFields)
            .from(DATA_ENTITY)
            .leftJoin(DATA_SOURCE)
            .on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_ENTITY.NAMESPACE_ID))
            .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(OWNER).on(OWNER.ID.eq(OWNERSHIP.OWNER_ID))
            .leftJoin(TITLE).on(TITLE.ID.eq(OWNERSHIP.TITLE_ID))
            .leftJoin(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(TAG).on(TAG.ID.eq(TAG_TO_DATA_ENTITY.TAG_ID))
            .leftJoin(METADATA_FIELD_VALUE).on(METADATA_FIELD_VALUE.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(METADATA_FIELD).on(METADATA_FIELD.ID.eq(METADATA_FIELD_VALUE.METADATA_FIELD_ID))
            .where(DATA_ENTITY.ID.eq(dataEntityId))
            .groupBy(groupByFields);
        return jooqReactiveOperations.mono(query)
            .map(dataEntityDtoMapper::mapDataEntitySearchFieldsRecord);
    }

    @Override
    public Mono<String> getHighlightedResult(final String text, final String query) {
        final String tsQuery = jooqFTSHelper.tsQuery(query);
        final String sql = "ts_headline('english', '%s', to_tsquery('%s'), 'HighlightAll=true')"
            .formatted(text, tsQuery);
        final var select = DSL.select(field(sql, String.class));
        return jooqReactiveOperations.mono(select)
            .map(Record1::value1);
    }

    @Override
    protected List<Field<?>> getNonUpdatableFields() {
        final List<Field<?>> dataEntityNonUpdatableFields = List.of(
            DATA_ENTITY.INTERNAL_NAME,
            DATA_ENTITY.INTERNAL_DESCRIPTION,
            DATA_ENTITY.VIEW_COUNT
        );

        // ad hoc until https://github.com/opendatadiscovery/odd-platform/issues/628 is closed
        return ListUtils.union(dataEntityNonUpdatableFields, super.getNonUpdatableFields())
            .stream()
            .filter(f -> !f.equals(DATA_ENTITY.CREATED_AT))
            .toList();
    }

    private Select<Record> baseDataEntityWithDatasourceAndNamespaceSelect(final List<Condition> conditions) {
        return DSL.select()
            .from(DATA_ENTITY)
            .leftJoin(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_ENTITY.NAMESPACE_ID))
            .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .where(conditions);
    }

    private DataEntityRecord buildHollowRecord(final String oddrn) {
        return new DataEntityRecord().setOddrn(oddrn).setHollow(true).setExcludeFromSearch(true);
    }

    private Field<Boolean> hasAlerts(final Table<Record> deCte) {
        return field(DSL.exists(DSL.selectOne().from(ALERT)
            .where(ALERT.DATA_ENTITY_ODDRN.eq(deCte.field(DATA_ENTITY.ODDRN)))
            .and(ALERT.STATUS.eq(AlertStatusEnum.OPEN.getCode())))).as(HAS_ALERTS_FIELD);
    }

    private Select<Record> baseDimensionsSelect(final DataEntityCTEQueryConfig cteConfig) {
        final Name deCteName = name(DATA_ENTITY_CTE_NAME);
        final Select<Record> dataEntitySelect = cteDataEntitySelect(cteConfig);
        final Table<Record> deCte = dataEntitySelect.asTable(deCteName);

        final List<Field<?>> groupByFields = Stream.of(deCte.fields(), NAMESPACE.fields(), DATA_SOURCE.fields())
            .flatMap(Arrays::stream)
            .toList();

        final List<Field<?>> aggregatedFields = List.of(
            jsonArrayAgg(field(OWNER.asterisk().toString())).as(AGG_OWNER_FIELD),
            jsonArrayAgg(field(TITLE.asterisk().toString())).as(AGG_TITLE_FIELD),
            jsonArrayAgg(field(OWNERSHIP.asterisk().toString())).as(AGG_OWNERSHIP_FIELD),
            hasAlerts(deCte));

        final Table<?> fromTable = DSL.table(deCteName)
            .leftJoin(DATA_SOURCE)
            .on(DATA_SOURCE.ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.DATA_SOURCE_ID)))
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.NAMESPACE_ID)))
            .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(jooqQueryHelper.getField(deCte, DATA_ENTITY.ID)))
            .leftJoin(OWNER).on(OWNER.ID.eq(OWNERSHIP.OWNER_ID))
            .leftJoin(TITLE).on(TITLE.ID.eq(OWNERSHIP.TITLE_ID));

        return DSL.with(deCteName)
            .asMaterialized(dataEntitySelect)
            .select(groupByFields)
            .select(aggregatedFields)
            .from(fromTable)
            .groupBy(groupByFields)
            .orderBy(getOrderFields(cteConfig, deCte));
    }

    private Select<Record> cteDataEntitySelect(final DataEntityCTEQueryConfig cteConfig) {
        final List<Field<?>> selectFields = new ArrayList<>(Arrays.stream(DATA_ENTITY.fields()).toList());
        final Table<?> fromTable;
        final List<Condition> conditions = addSoftDeleteFilter(ListUtils.emptyIfNull(cteConfig.getConditions()));
        conditions.add(DATA_ENTITY.HOLLOW.isFalse());
        if (cteConfig.getFts() != null) {
            final Field<?> rankField = jooqFTSHelper
                .ftsRankField(SEARCH_ENTRYPOINT.SEARCH_VECTOR, cteConfig.getFts().query());
            selectFields.add(rankField.as(cteConfig.getFts().rankFieldAlias()));

            fromTable = SEARCH_ENTRYPOINT
                .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(SEARCH_ENTRYPOINT.DATA_ENTITY_ID));
            conditions.add(jooqFTSHelper.ftsCondition(SEARCH_ENTRYPOINT.SEARCH_VECTOR, cteConfig.getFts().query()));
        } else {
            fromTable = DATA_ENTITY;
        }
        return DSL
            .select(selectFields)
            .from(fromTable)
            .where(conditions)
            .orderBy(getOrderFields(cteConfig))
            .limit(cteConfig.getLimitOffset() != null ? DSL.val(cteConfig.getLimitOffset().limit()) :
                DSL.noField(Integer.class))
            .offset(cteConfig.getLimitOffset() != null ? DSL.val(cteConfig.getLimitOffset().offset()) :
                DSL.noField(Integer.class));
    }

    private List<OrderField<?>> getOrderFields(final DataEntityCTEQueryConfig cteConfig) {
        return getOrderFields(cteConfig, null);
    }

    private List<OrderField<?>> getOrderFields(final DataEntityCTEQueryConfig cteConfig,
                                               final Table<? extends Record> deCte) {
        final List<OrderField<?>> orderFields = new ArrayList<>();
        if (cteConfig.getOrderBy() != null) {
            if (deCte != null) {
                orderFields.add(deCte.field(cteConfig.getOrderBy().getName()).sort(cteConfig.getOrderBy().getOrder()));
            } else {
                orderFields.add(field(cteConfig.getOrderBy().getName()).sort(cteConfig.getOrderBy().getOrder()));
            }
        }
        if (cteConfig.getFts() != null) {
            if (deCte != null) {
                orderFields.add(deCte.field(cteConfig.getFts().rankFieldAlias()).desc());
            } else {
                orderFields.add(field(cteConfig.getFts().rankFieldAlias()).desc());
            }
        }
        if (deCte != null) {
            orderFields.add(deCte.field(DATA_ENTITY.ID).desc());
        } else {
            orderFields.add(field(DATA_ENTITY.ID).desc());
        }
        return orderFields;
    }
}
