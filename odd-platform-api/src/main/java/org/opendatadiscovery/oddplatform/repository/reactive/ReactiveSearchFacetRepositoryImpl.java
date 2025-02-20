package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Record2;
import org.jooq.Record3;
import org.jooq.SelectJoinStep;
import org.jooq.SelectOrderByStep;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTaskRunStatusDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;
import org.opendatadiscovery.oddplatform.dto.SearchFilterId;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.SearchFacetsRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.coalesce;
import static org.jooq.impl.DSL.count;
import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.select;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_VERSION;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TASK_LAST_RUN;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_ENTITY_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_FACETS;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_SEARCH_ENTRYPOINT;

@Repository
@RequiredArgsConstructor
public class ReactiveSearchFacetRepositoryImpl implements ReactiveSearchFacetRepository {

    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqFTSHelper jooqFTSHelper;

    private static final Collector<Record3<Long, String, Integer>, ?, Map<SearchFilterId, Long>> FACET_COLLECTOR
        = Collectors.toMap(
        r -> SearchFilterId.builder().entityId(r.component1()).name(r.component2()).build(),
        r -> r.component3().longValue()
    );

    @Override
    public Mono<SearchFacetsPojo> create(final SearchFacetsPojo pojo) {
        final SearchFacetsRecord record = jooqReactiveOperations.newRecord(SEARCH_FACETS, pojo);

        return jooqReactiveOperations
            .mono(DSL.insertInto(SEARCH_FACETS).set(record).returning())
            .map(r -> r.into(SearchFacetsPojo.class));
    }

    @Override
    public Mono<SearchFacetsPojo> update(final SearchFacetsPojo pojo) {
        final var query = DSL.update(SEARCH_FACETS)
            .set(SEARCH_FACETS.FILTERS, pojo.getFilters())
            .set(SEARCH_FACETS.QUERY_STRING, pojo.getQueryString())
            .set(SEARCH_FACETS.LAST_ACCESSED_AT, pojo.getLastAccessedAt())
            .where(SEARCH_FACETS.ID.eq(pojo.getId()))
            .returning();

        return jooqReactiveOperations
            .mono(query)
            .map(r -> r.into(SearchFacetsPojo.class));
    }

    @Override
    public Mono<SearchFacetsPojo> get(final UUID id) {
        final var query = DSL.update(SEARCH_FACETS)
            .set(SEARCH_FACETS.LAST_ACCESSED_AT, DSL.currentOffsetDateTime())
            .where(SEARCH_FACETS.ID.eq(id))
            .returning();

        return jooqReactiveOperations.mono(query).map(r -> r.into(SearchFacetsPojo.class));
    }

    @Override
    public Mono<Map<SearchFilterId, Long>> getTagFacetForTerms(final String facetQuery, final int page, final int size,
                                                               final FacetStateDto state) {
        final var select = DSL.select(TAG.ID, TAG.NAME, countDistinct(TERM_SEARCH_ENTRYPOINT.TERM_ID))
            .from(TAG)
            .leftJoin(TAG_TO_TERM).on(TAG_TO_TERM.TAG_ID.eq(TAG.ID))
            .leftJoin(TERM_SEARCH_ENTRYPOINT).on(TERM_SEARCH_ENTRYPOINT.TERM_ID.eq(TAG_TO_TERM.TERM_ID));

        if (StringUtils.isNotEmpty(state.getQuery())) {
            select.and(jooqFTSHelper.ftsCondition(TERM_SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
        }

        select
            .leftJoin(TERM)
            .on(TERM_SEARCH_ENTRYPOINT.TERM_ID.eq(TERM.ID))
            .and(TERM.DELETED_AT.isNull())
            .where(TAG.NAME.containsIgnoreCase(StringUtils.isNotEmpty(facetQuery) ? facetQuery : ""))
            .and(TAG.DELETED_AT.isNull())
            .groupBy(TAG.ID, TAG.NAME)
            .orderBy(countDistinct(TERM_SEARCH_ENTRYPOINT.TERM_ID).desc())
            .limit(size)
            .offset((page - 1) * size);

        return jooqReactiveOperations.flux(select)
            .collect(FACET_COLLECTOR);
    }

    @Override
    public Mono<Map<SearchFilterId, Long>> getOwnerFacetForTerms(final String facetQuery, final int page,
                                                                 final int size,
                                                                 final FacetStateDto state) {
        final var select = DSL.select(OWNER.ID, OWNER.NAME, countDistinct(TERM_SEARCH_ENTRYPOINT.TERM_ID))
            .from(OWNER)
            .leftJoin(TERM_OWNERSHIP).on(TERM_OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .leftJoin(TERM_SEARCH_ENTRYPOINT).on(TERM_SEARCH_ENTRYPOINT.TERM_ID.eq(TERM_OWNERSHIP.TERM_ID));

        if (StringUtils.isNotEmpty(state.getQuery())) {
            select.and(jooqFTSHelper.ftsCondition(TERM_SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
        }

        select
            .leftJoin(TERM)
            .on(TERM_SEARCH_ENTRYPOINT.TERM_ID.eq(TERM.ID))
            .and(TERM.DELETED_AT.isNull())
            .where(OWNER.NAME.containsIgnoreCase((StringUtils.isNotEmpty(facetQuery) ? facetQuery : "")))
            .and(OWNER.DELETED_AT.isNull())
            .groupBy(OWNER.ID, OWNER.NAME)
            .orderBy(countDistinct(TERM_SEARCH_ENTRYPOINT.TERM_ID).desc())
            .limit(size)
            .offset((page - 1) * size);

        return jooqReactiveOperations.flux(select)
            .collect(FACET_COLLECTOR);
    }

    @Override
    public Mono<Map<SearchFilterId, Long>> getEntityClassFacetForDataEntity(final FacetStateDto state) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(DATA_ENTITY.HOLLOW.isFalse());
        conditions.add(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()));
        if (!deletedEntitiesAreRequested(state.getState())) {
            conditions.add(DATA_ENTITY.STATUS.ne(DataEntityStatusDto.DELETED.getId()));
        }

        final String entityClassUnnestedField = "entity_class_id";
        final String deCountField = "data_entity_count";

        var select = DSL
            .select(field("unnest(?)", DATA_ENTITY.ENTITY_CLASS_IDS).as(entityClassUnnestedField))
            .select(count(DATA_ENTITY.ID).as(deCountField))
            .from(DATA_ENTITY);

        if (StringUtils.isNotEmpty(state.getQuery())) {
            select.join(SEARCH_ENTRYPOINT).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID));
            conditions.add(jooqFTSHelper.ftsCondition(SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
        }
        final Set<Long> dataSourceIds = state.getFacetEntitiesIds(FacetType.DATA_SOURCES);
        if (!CollectionUtils.isEmpty(dataSourceIds)) {
            conditions.add(DATA_ENTITY.DATA_SOURCE_ID.in(dataSourceIds));
        }
        final Set<Long> ownerIds = state.getFacetEntitiesIds(FacetType.OWNERS);
        if (!CollectionUtils.isEmpty(ownerIds)) {
            select.join(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID));
            conditions.add(OWNERSHIP.OWNER_ID.in(ownerIds));
        }
        final Set<Long> namespaceIds = state.getFacetEntitiesIds(FacetType.NAMESPACES);
        if (!CollectionUtils.isEmpty(namespaceIds)) {
            select.leftJoin(DATA_SOURCE)
                .on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
                .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_ENTITY.NAMESPACE_ID))
                .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID));
            conditions.add(NAMESPACE.ID.in(namespaceIds));
        }
        final Set<Long> tagIds = state.getFacetEntitiesIds(FacetType.TAGS);
        if (!CollectionUtils.isEmpty(tagIds)) {
            final var dataEntities = getRelatedEntitiesAndFieldsToTag(tagIds);

            conditions.add(DATA_ENTITY.ID.in(dataEntities));
        }

        final Set<Long> groupIds = state.getFacetEntitiesIds(FacetType.GROUPS);
        if (!CollectionUtils.isEmpty(groupIds)) {
            select = select.join(GROUP_ENTITY_RELATIONS)
                .on(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(DATA_ENTITY.ODDRN));

            final var groupOddrns = DSL.select(DATA_ENTITY.ODDRN)
                .from(DATA_ENTITY)
                .where(DATA_ENTITY.ID.in(groupIds));
            conditions.add(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.in(groupOddrns));
        }

        final Set<Long> typeIds = state.getFacetEntitiesIds(FacetType.TYPES);
        if (!CollectionUtils.isEmpty(typeIds)) {
            conditions.add(DATA_ENTITY.TYPE_ID.in(typeIds));
        }

        final Set<Long> statusIds = state.getFacetEntitiesIds(FacetType.STATUSES);
        if (!CollectionUtils.isEmpty(statusIds)) {
            conditions.add(DATA_ENTITY.STATUS.in(statusIds));
        }

        select
            .where(conditions)
            .groupBy(field(entityClassUnnestedField));
        final Flux<Pair<SearchFilterId, Long>> existingClasses = jooqReactiveOperations.flux(select)
            .map(r -> {
                final Integer entityClassId = r.get(entityClassUnnestedField, Integer.class);

                final DataEntityClassDto entityClass = DataEntityClassDto.findById(entityClassId)
                    .orElseThrow(() -> new IllegalArgumentException(
                        String.format("There's no entity class with id %d", entityClassId)));

                return Pair.of(entityClassToSearchFilter(entityClass), r.get(deCountField, Long.class));
            });

        final Flux<Pair<SearchFilterId, Long>> allEntityClasses = Flux
            .fromStream(Arrays.stream(DataEntityClassDto.values()))
            .map(s -> Pair.of(entityClassToSearchFilter(s), 0L));

        return Flux.concat(existingClasses, allEntityClasses)
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight, (c1, c2) -> c1 == 0 ? c2 : c1));
    }

    @Override
    public Mono<Map<SearchFilterId, Long>> getTypeFacetForDataEntity(final String facetQuery,
                                                                     final int page,
                                                                     final int size,
                                                                     final FacetStateDto state) {
        final Long selectedEntityClass = state.selectedDataEntityClass().orElse(null);
        if (selectedEntityClass == null) {
            return Mono.empty();
        }
        final List<Condition> conditions = getDataEntityDefaultConditions();
        var select = DSL
            .select(DATA_ENTITY.TYPE_ID, count(DATA_ENTITY.ID))
            .from(DATA_ENTITY);

        if (StringUtils.isNotEmpty(state.getQuery())) {
            select.join(SEARCH_ENTRYPOINT).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID));
            conditions.add(jooqFTSHelper.ftsCondition(SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
        }

        final Set<Long> dataSourceIds = state.getFacetEntitiesIds(FacetType.DATA_SOURCES);
        if (!CollectionUtils.isEmpty(dataSourceIds)) {
            conditions.add(DATA_ENTITY.DATA_SOURCE_ID.in(dataSourceIds));
        }
        final Set<Long> ownerIds = state.getFacetEntitiesIds(FacetType.OWNERS);
        if (!CollectionUtils.isEmpty(ownerIds)) {
            select.join(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID));
            conditions.add(OWNERSHIP.OWNER_ID.in(ownerIds));
        }
        final Set<Long> namespaceIds = state.getFacetEntitiesIds(FacetType.NAMESPACES);
        if (!CollectionUtils.isEmpty(namespaceIds)) {
            select.leftJoin(DATA_SOURCE)
                .on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
                .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_ENTITY.NAMESPACE_ID))
                .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID));
            conditions.add(NAMESPACE.ID.in(namespaceIds));
        }
        final Set<Long> tagIds = state.getFacetEntitiesIds(FacetType.TAGS);
        if (!CollectionUtils.isEmpty(tagIds)) {
            select = select.join(TAG_TO_DATA_ENTITY)
                .on(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(DATA_ENTITY.ID));
            conditions.add(TAG_TO_DATA_ENTITY.TAG_ID.in(tagIds));
        }

        final Set<Long> groupIds = state.getFacetEntitiesIds(FacetType.GROUPS);
        if (!CollectionUtils.isEmpty(groupIds)) {
            select = select.join(GROUP_ENTITY_RELATIONS)
                .on(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(DATA_ENTITY.ODDRN));

            final var groupOddrns = DSL.select(DATA_ENTITY.ODDRN)
                .from(DATA_ENTITY)
                .where(DATA_ENTITY.ID.in(groupIds));
            conditions.add(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.in(groupOddrns));
        }
        conditions.add(DATA_ENTITY.ENTITY_CLASS_IDS.contains(new Integer[] {selectedEntityClass.intValue()}));
        final List<Integer> typeIds = typeIdsByName(facetQuery);
        if (!typeIds.isEmpty()) {
            conditions.add(DATA_ENTITY.TYPE_ID.in(typeIds));
        }

        select
            .where(conditions)
            .groupBy(DATA_ENTITY.TYPE_ID)
            .orderBy(count(DATA_ENTITY.ID).desc())
            .limit(size)
            .offset((page - 1) * size);

        final Flux<Pair<SearchFilterId, Long>> existingTypes = jooqReactiveOperations.flux(select)
            .map(r -> {
                final DataEntityTypeDto type = DataEntityTypeDto.findById(r.component1())
                    .orElseThrow(() -> new IllegalArgumentException(
                        String.format("There's no type with id %d", r.component1())));

                return Pair.of(typeToSearchFilter(type), r.component2().longValue());
            });

        final Flux<Pair<SearchFilterId, Long>> allClassTypes =
            Flux.fromStream(DataEntityClassDto.findById(selectedEntityClass.intValue())
                    .map(DataEntityClassDto::getTypes)
                    .stream()
                    .flatMap(Set::stream))
                .map(s -> Pair.of(typeToSearchFilter(s), 0L));

        return Flux.concat(existingTypes, allClassTypes)
            .filter(s -> StringUtils.isEmpty(facetQuery)
                || StringUtils.containsIgnoreCase(facetQuery, s.getLeft().getName()))
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight, (t1, t2) -> t1 == 0 ? t2 : t1));
    }

    @Override
    public Mono<Map<SearchFilterId, Long>> getOwnerFacetForDataEntity(final String facetQuery,
                                                                      final int page,
                                                                      final int size,
                                                                      final FacetStateDto state) {
        final var select = DSL.select(OWNER.ID, OWNER.NAME, countDistinct(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
            .from(OWNER)
            .leftJoin(OWNERSHIP).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .leftJoin(SEARCH_ENTRYPOINT).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(OWNERSHIP.DATA_ENTITY_ID))
            .leftJoin(DATA_ENTITY).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID));

        final List<Condition> conditions = getDataEntityDefaultConditions();

        final Set<Long> dataSourceIds = state.getFacetEntitiesIds(FacetType.DATA_SOURCES);
        if (!dataSourceIds.isEmpty()) {
            select.join(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID));
            conditions.add(DATA_SOURCE.ID.in(dataSourceIds));
        }

        conditions.addAll(getQueryAndEntityClassConditions(state));
        if (StringUtils.isNotEmpty(facetQuery)) {
            conditions.add(OWNER.NAME.containsIgnoreCase(facetQuery));
        }
        conditions.add(OWNER.DELETED_AT.isNull());

        select
            .where(conditions)
            .groupBy(OWNER.ID, OWNER.NAME)
            .orderBy(countDistinct(SEARCH_ENTRYPOINT.DATA_ENTITY_ID).desc())
            .limit(size)
            .offset((page - 1) * size);
        return jooqReactiveOperations.flux(select)
            .collect(FACET_COLLECTOR);
    }

    @Override
    public Mono<Map<SearchFilterId, Long>> getTagFacetForDataEntity(final String facetQuery,
                                                                    final int page,
                                                                    final int size,
                                                                    final FacetStateDto state) {
        final var select = DSL.select(TAG.ID, TAG.NAME, countDistinct(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
            .from(TAG)
            .leftJoin(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.TAG_ID.eq(TAG.ID))
            .leftJoin(SEARCH_ENTRYPOINT).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID))
            .leftJoin(DATA_ENTITY).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID));

        final List<Condition> conditions = getDataEntityDefaultConditions();

        final Set<Long> dataSourceIds = state.getFacetEntitiesIds(FacetType.DATA_SOURCES);
        if (!dataSourceIds.isEmpty()) {
            select.join(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID));
            conditions.add(DATA_SOURCE.ID.in(dataSourceIds));
        }

        conditions.addAll(getQueryAndEntityClassConditions(state));
        if (StringUtils.isNotEmpty(facetQuery)) {
            conditions.add(TAG.NAME.containsIgnoreCase(facetQuery));
        }
        conditions.add(TAG.DELETED_AT.isNull());

        select
            .where(conditions)
            .groupBy(TAG.ID, TAG.NAME)
            .orderBy(countDistinct(SEARCH_ENTRYPOINT.DATA_ENTITY_ID).desc())
            .limit(size)
            .offset((page - 1) * size);
        return jooqReactiveOperations.flux(select)
            .collect(FACET_COLLECTOR);
    }

    @Override
    public Mono<Map<SearchFilterId, Long>> getGroupFacetForDataEntity(final String facetQuery,
                                                                      final int page,
                                                                      final int size,
                                                                      final FacetStateDto state) {
        final Field<Integer> dataEntityCount = countDistinct(DATA_ENTITY.ID).as("data_entity_count");
        final var cteSelect = DSL.select(GROUP_ENTITY_RELATIONS.GROUP_ODDRN, dataEntityCount)
            .from(GROUP_ENTITY_RELATIONS)
            .leftJoin(DATA_ENTITY).on(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(DATA_ENTITY.ODDRN))
            .leftJoin(SEARCH_ENTRYPOINT).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID));

        final List<Condition> cteConditions = getDataEntityDefaultConditions();

        final Set<Long> dataSourceIds = state.getFacetEntitiesIds(FacetType.DATA_SOURCES);
        if (!dataSourceIds.isEmpty()) {
            cteSelect.join(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID));
            cteConditions.add(DATA_SOURCE.ID.in(dataSourceIds));
        }
        cteConditions.addAll(getQueryAndEntityClassConditions(state));

        cteSelect
            .where(cteConditions)
            .groupBy(GROUP_ENTITY_RELATIONS.GROUP_ODDRN)
            .orderBy(dataEntityCount.desc());

        final Table<? extends Record> cte = cteSelect.asTable("cte");
        final Field<String> groupName = coalesce(DATA_ENTITY.INTERNAL_NAME, DATA_ENTITY.EXTERNAL_NAME);

        final List<Condition> conditions = getDataEntityDefaultConditions();
        if (StringUtils.isNotEmpty(facetQuery)) {
            conditions.add(groupName.containsIgnoreCase(facetQuery));
        }
        final var select = DSL.with(cte.getName())
            .as(cteSelect)
            .select(DATA_ENTITY.ID, groupName, cte.field(dataEntityCount))
            .from(cte.getName())
            .join(DATA_ENTITY).on(cte.field(GROUP_ENTITY_RELATIONS.GROUP_ODDRN).eq(DATA_ENTITY.ODDRN))
            .where(conditions)
            .orderBy(cte.field(dataEntityCount).desc())
            .limit(size)
            .offset((page - 1) * size);
        return jooqReactiveOperations.flux(select)
            .collect(FACET_COLLECTOR);
    }

    @Override
    public Mono<Map<SearchFilterId, Long>> getStatusFacetForDataEntity(final String query,
                                                                       final int page,
                                                                       final int size,
                                                                       final FacetStateDto state) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(DATA_ENTITY.HOLLOW.isFalse());
        conditions.add(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()));
        conditions.addAll(getQueryAndEntityClassConditions(state));
        var select = DSL
            .select(DATA_ENTITY.STATUS, count(DATA_ENTITY.ID))
            .from(DATA_ENTITY);

        select = addAdditionalJoinsByState(state, conditions, select);

        final List<Short> statusIds = statusIdsByName(query);
        if (!statusIds.isEmpty()) {
            conditions.add(DATA_ENTITY.STATUS.in(statusIds));
        }

        select
            .where(conditions)
            .groupBy(DATA_ENTITY.STATUS)
            .orderBy(count(DATA_ENTITY.ID).desc())
            .limit(size)
            .offset((page - 1) * size);

        final Flux<Pair<SearchFilterId, Long>> existingStatuses = jooqReactiveOperations.flux(select)
            .map(r -> {
                final DataEntityStatusDto status = DataEntityStatusDto.findById(r.component1())
                    .orElseThrow(() -> new IllegalArgumentException(
                        String.format("There's no status with id %d", r.component1())));

                return Pair.of(statusToSearchFilter(status), r.component2().longValue());
            });

        final Flux<Pair<SearchFilterId, Long>> all = Flux.fromStream(Arrays.stream(DataEntityStatusDto.values()))
            .map(s -> Pair.of(statusToSearchFilter(s), 0L));

        return Flux.concat(existingStatuses, all)
            .filter(s -> StringUtils.isEmpty(query)
                || StringUtils.containsIgnoreCase(query, s.getLeft().getName()))
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight, (t1, t2) -> t1 == 0 ? t2 : t1));
    }

    @Override
    public Mono<Map<SearchFilterId, Long>> getLastRunStatusesFacetForDataEntity(final String query,
                                                                                final int page,
                                                                                final int size,
                                                                                final FacetStateDto state) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(DATA_ENTITY.HOLLOW.isFalse());
        conditions.add(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()));
        conditions.addAll(getQueryAndEntityClassConditions(state));

        SelectJoinStep<Record2<String, Integer>> select =
            select(DATA_ENTITY_TASK_LAST_RUN.STATUS, count(DATA_ENTITY_TASK_LAST_RUN.LAST_TASK_RUN_ODDRN))
                .from(DATA_ENTITY_TASK_LAST_RUN)
                .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN));

        select = addAdditionalJoinsByState(state, conditions, select);

        if (StringUtils.isNotBlank(query)) {
            conditions.add(DATA_ENTITY_TASK_LAST_RUN.STATUS.containsIgnoreCase(query));
        }

        select
            .where(conditions)
            .groupBy(DATA_ENTITY_TASK_LAST_RUN.STATUS)
            .orderBy(count(DATA_ENTITY_TASK_LAST_RUN.LAST_TASK_RUN_ODDRN).desc())
            .limit(size)
            .offset((page - 1) * size);

        final Flux<Pair<SearchFilterId, Long>> existingStatuses = jooqReactiveOperations.flux(select)
            .map(r -> {
                final DataEntityTaskRunStatusDto status = DataEntityTaskRunStatusDto.findByStatus(r.component1())
                    .orElseThrow(() -> new IllegalArgumentException(
                        String.format("There's no last run status with name %s", r.component1())));

                return Pair.of(lastRunStatusToSearchFilter(status), r.component2().longValue());
            });

        final Flux<Pair<SearchFilterId, Long>> all = Flux.fromStream(Arrays.stream(DataEntityTaskRunStatusDto.values()))
            .map(s -> Pair.of(lastRunStatusToSearchFilter(s), 0L));

        return Flux.concat(existingStatuses, all)
            .filter(s -> StringUtils.isEmpty(query)
                || StringUtils.containsIgnoreCase(query, s.getLeft().getName()))
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight, (t1, t2) -> t1 == 0 ? t2 : t1));
    }

    private SelectJoinStep addAdditionalJoinsByState(final FacetStateDto state,
                                                     final List<Condition> conditions,
                                                     final SelectJoinStep select) {
//      Checkstyle forced me to do that
        SelectJoinStep resultSelect = select;
        if (StringUtils.isNotEmpty(state.getQuery())) {
            resultSelect.join(SEARCH_ENTRYPOINT).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID));
            conditions.add(jooqFTSHelper.ftsCondition(SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
        }

        final Set<Long> dataSourceIds = state.getFacetEntitiesIds(FacetType.DATA_SOURCES);
        if (!CollectionUtils.isEmpty(dataSourceIds)) {
            conditions.add(DATA_ENTITY.DATA_SOURCE_ID.in(dataSourceIds));
        }
        final Set<Long> ownerIds = state.getFacetEntitiesIds(FacetType.OWNERS);
        if (!CollectionUtils.isEmpty(ownerIds)) {
            resultSelect.join(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID));
            conditions.add(OWNERSHIP.OWNER_ID.in(ownerIds));
        }
        final Set<Long> namespaceIds = state.getFacetEntitiesIds(FacetType.NAMESPACES);
        if (!CollectionUtils.isEmpty(namespaceIds)) {
            resultSelect.leftJoin(DATA_SOURCE)
                .on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
                .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_ENTITY.NAMESPACE_ID))
                .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID));
            conditions.add(NAMESPACE.ID.in(namespaceIds));
        }
        final Set<Long> tagIds = state.getFacetEntitiesIds(FacetType.TAGS);
        if (!CollectionUtils.isEmpty(tagIds)) {
            resultSelect = resultSelect.join(TAG_TO_DATA_ENTITY)
                .on(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(DATA_ENTITY.ID));
            conditions.add(TAG_TO_DATA_ENTITY.TAG_ID.in(tagIds));
        }

        final Set<Long> groupIds = state.getFacetEntitiesIds(FacetType.GROUPS);
        if (!CollectionUtils.isEmpty(groupIds)) {
            resultSelect = resultSelect.join(GROUP_ENTITY_RELATIONS)
                .on(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(DATA_ENTITY.ODDRN));

            final var groupOddrns = DSL.select(DATA_ENTITY.ODDRN)
                .from(DATA_ENTITY)
                .where(DATA_ENTITY.ID.in(groupIds));
            conditions.add(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.in(groupOddrns));
        }

        return resultSelect;
    }

    private List<Integer> typeIdsByName(final String name) {
        return Arrays.stream(DataEntityTypeDto.values())
            .filter(s -> StringUtils.containsIgnoreCase(name, s.name()))
            .map(DataEntityTypeDto::getId)
            .toList();
    }

    private List<Short> statusIdsByName(final String name) {
        return Arrays.stream(DataEntityStatusDto.values())
            .filter(s -> StringUtils.containsIgnoreCase(name, s.name()))
            .map(DataEntityStatusDto::getId)
            .toList();
    }

    private SearchFilterId typeToSearchFilter(final DataEntityTypeDto type) {
        return SearchFilterId.builder()
            .entityId(type.getId())
            .name(type.name())
            .build();
    }

    private SearchFilterId entityClassToSearchFilter(final DataEntityClassDto entityClass) {
        return SearchFilterId.builder()
            .entityId(entityClass.getId())
            .name(entityClass.name())
            .build();
    }

    private SearchFilterId statusToSearchFilter(final DataEntityStatusDto status) {
        return SearchFilterId.builder()
            .entityId(status.getId())
            .name(status.name())
            .build();
    }

    private SearchFilterId lastRunStatusToSearchFilter(final DataEntityTaskRunStatusDto lastRunStatus) {
        return SearchFilterId.builder()
            .entityId(lastRunStatus.getId())
            .name(lastRunStatus.name())
            .build();
    }

    private List<Condition> getDataEntityDefaultConditions() {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(DATA_ENTITY.HOLLOW.isFalse());
        conditions.add(DATA_ENTITY.STATUS.ne(DataEntityStatusDto.DELETED.getId()));
        conditions.add(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()));
        return conditions;
    }

    private List<Condition> getQueryAndEntityClassConditions(final FacetStateDto state) {
        final List<Condition> conditions = new ArrayList<>();
        if (StringUtils.isNotEmpty(state.getQuery())) {
            conditions.add(jooqFTSHelper.ftsCondition(SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
        }
        final Long selectedEntityClass = state.selectedDataEntityClass().orElse(null);
        if (selectedEntityClass != null) {
            conditions.add(DATA_ENTITY.ENTITY_CLASS_IDS.contains(new Integer[] {selectedEntityClass.intValue()}));
        }
        return conditions;
    }

    private boolean deletedEntitiesAreRequested(final Map<FacetType, List<SearchFilterDto>> facetStateMap) {
        return facetStateMap.getOrDefault(FacetType.STATUSES, List.of()).stream()
            .anyMatch(f -> f.getEntityId() == DataEntityStatusDto.DELETED.getId());
    }

    private  SelectOrderByStep<Record1<Long>> getRelatedEntitiesAndFieldsToTag(final Set<Long> tagIds) {
        return select(DATA_ENTITY.ID)
            .from(TAG_TO_DATA_ENTITY, DATA_ENTITY)
            .where(TAG_TO_DATA_ENTITY.TAG_ID.in(tagIds))
            .and(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .union(select(DATA_ENTITY.ID)
                .from(DATASET_VERSION, DATA_ENTITY)
                .where(DATASET_VERSION.ID.in(
                            select(DATASET_STRUCTURE.DATASET_VERSION_ID)
                                .from(DATASET_STRUCTURE, DATASET_FIELD, TAG_TO_DATASET_FIELD)
                                .where(DATASET_STRUCTURE.DATASET_VERSION_ID.in(
                                    select(DSL.max(DATASET_VERSION.ID))
                                        .from(DATASET_VERSION)
                                        .groupBy(DATASET_VERSION.DATASET_ODDRN)))
                                .and(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
                                .and(TAG_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
                                .and(TAG_TO_DATASET_FIELD.TAG_ID.in(tagIds))
                        )
                        .and(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
                )
            );
    }
}
