package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.DatePart;
import org.jooq.Field;
import org.jooq.InsertSetStep;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SelectJoinStep;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ActivityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.ActivityRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.row;
import static org.jooq.impl.DSL.trunc;
import static org.opendatadiscovery.oddplatform.model.Tables.ACTIVITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.USER_OWNER_MAPPING;

@Repository
@RequiredArgsConstructor
public class ReactiveActivityRepositoryImpl implements ReactiveActivityRepository {
    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqRecordHelper jooqRecordHelper;
    private final JooqQueryHelper jooqQueryHelper;

    @Override
    public Mono<ActivityPojo> saveReturning(final ActivityPojo pojo) {
        final ActivityRecord record = jooqReactiveOperations.newRecord(ACTIVITY, pojo);
        return jooqReactiveOperations.mono(DSL.insertInto(ACTIVITY).set(record).returning())
            .map(r -> r.into(ACTIVITY).into(ActivityPojo.class));
    }

    @Override
    public Mono<Void> save(final List<ActivityPojo> pojos) {
        final List<ActivityRecord> records = pojos.stream()
            .map(p -> jooqReactiveOperations.newRecord(ACTIVITY, p))
            .toList();

        return jooqReactiveOperations.executeInPartition(records, rs -> {
            InsertSetStep<ActivityRecord> insertStep = DSL.insertInto(ACTIVITY);

            for (int i = 0; i < rs.size() - 1; i++) {
                insertStep = insertStep.set(rs.get(i)).newRecord();
            }

            return jooqReactiveOperations.mono(insertStep.set(rs.get(rs.size() - 1)));
        });
    }

    @Override
    public Flux<ActivityDto> findAllActivities(final OffsetDateTime beginDate,
                                               final OffsetDateTime endDate,
                                               final Integer size,
                                               final Long datasourceId,
                                               final Long namespaceId,
                                               final List<Long> tagIds,
                                               final List<Long> ownerIds,
                                               final List<Long> userIds,
                                               final List<String> usernames,
                                               final ActivityEventTypeDto eventType,
                                               final Long lastEventId,
                                               final OffsetDateTime lastEventDateTime) {
        final var baseQuery = buildBaseQuery(datasourceId, namespaceId);
        final List<Condition> conditions = getCommonConditions(beginDate, endDate, datasourceId, namespaceId, tagIds,
            ownerIds, userIds, usernames, eventType);
        return findActivities(baseQuery, conditions, lastEventId, lastEventDateTime, size);
    }

    @Override
    public Flux<ActivityDto> findMyActivities(final OffsetDateTime beginDate,
                                              final OffsetDateTime endDate,
                                              final Integer size,
                                              final Long datasourceId,
                                              final Long namespaceId,
                                              final List<Long> tagIds,
                                              final List<Long> userIds,
                                              final List<String> usernames,
                                              final ActivityEventTypeDto eventType,
                                              final Long currentOwnerId,
                                              final Long lastEventId,
                                              final OffsetDateTime lastEventDateTime) {
        final var baseQuery = buildBaseQuery(datasourceId, namespaceId);
        final List<Condition> conditions = getCommonConditions(beginDate, endDate, datasourceId, namespaceId, tagIds,
            List.of(currentOwnerId), userIds, usernames, eventType);
        return findActivities(baseQuery, conditions, lastEventId, lastEventDateTime, size);
    }

    @Override
    public Flux<ActivityDto> findDependentActivities(final OffsetDateTime beginDate,
                                                     final OffsetDateTime endDate,
                                                     final Integer size,
                                                     final Long datasourceId,
                                                     final Long namespaceId,
                                                     final List<Long> tagIds,
                                                     final List<Long> userIds,
                                                     final List<String> usernames,
                                                     final ActivityEventTypeDto eventType,
                                                     final List<String> oddrns,
                                                     final Long lastEventId,
                                                     final OffsetDateTime lastEventDateTime) {
        final var baseQuery = buildBaseQuery(datasourceId, namespaceId);
        final List<Condition> conditions = getCommonConditions(beginDate, endDate, datasourceId, namespaceId, tagIds,
            List.of(), userIds, usernames, eventType);
        conditions.add(DATA_ENTITY.ODDRN.in(oddrns));
        return findActivities(baseQuery, conditions, lastEventId, lastEventDateTime, size);
    }

    @Override
    public Flux<ActivityDto> findDataEntityActivities(final OffsetDateTime beginDate,
                                                      final OffsetDateTime endDate,
                                                      final Integer size,
                                                      final Long dataEntityId,
                                                      final List<Long> userIds,
                                                      final List<String> usernames,
                                                      final ActivityEventTypeDto eventType,
                                                      final Long lastEventId,
                                                      final OffsetDateTime lastEventDateTime) {
        final var baseQuery = buildBaseQuery(null, null);
        final List<Condition> conditions = getCommonConditions(beginDate, endDate, null, null, List.of(),
            List.of(), userIds, usernames, eventType);
        conditions.add(DATA_ENTITY.ID.eq(dataEntityId));
        return findActivities(baseQuery, conditions, lastEventId, lastEventDateTime, size);
    }

    @Override
    public Mono<Long> getTotalActivitiesCount(final OffsetDateTime beginDate,
                                              final OffsetDateTime endDate,
                                              final Long datasourceId,
                                              final Long namespaceId,
                                              final List<Long> tagIds,
                                              final List<Long> ownerIds,
                                              final List<Long> userIds,
                                              final List<String> usernames,
                                              final ActivityEventTypeDto eventType) {
        final var countQuery = DSL.selectCount()
            .from(ACTIVITY)
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(ACTIVITY.DATA_ENTITY_ID))
            .leftJoin(USER_OWNER_MAPPING)
            .on(USER_OWNER_MAPPING.OIDC_USERNAME.eq(ACTIVITY.CREATED_BY)
                .and(USER_OWNER_MAPPING.DELETED_AT.isNull()));
        addJoins(countQuery, datasourceId, namespaceId);
        final List<Condition> conditions =
            getCommonConditions(beginDate, endDate, datasourceId, namespaceId, tagIds, ownerIds, userIds, usernames,
                eventType);
        return getActivityCount(countQuery, conditions);
    }

    @Override
    public Mono<Long> getMyObjectsActivitiesCount(final OffsetDateTime beginDate,
                                                  final OffsetDateTime endDate,
                                                  final Long datasourceId,
                                                  final Long namespaceId,
                                                  final List<Long> tagIds,
                                                  final List<Long> userIds,
                                                  final List<String> usernames,
                                                  final ActivityEventTypeDto eventType,
                                                  final Long currentOwnerId) {
        final var countQuery = DSL.selectCount()
            .from(ACTIVITY)
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(ACTIVITY.DATA_ENTITY_ID))
            .leftJoin(USER_OWNER_MAPPING)
            .on(USER_OWNER_MAPPING.OIDC_USERNAME.eq(ACTIVITY.CREATED_BY)
                .and(USER_OWNER_MAPPING.DELETED_AT.isNull()));
        addJoins(countQuery, datasourceId, namespaceId);
        final List<Condition> conditions = getCommonConditions(beginDate, endDate, datasourceId, namespaceId, tagIds,
            List.of(currentOwnerId), userIds, usernames, eventType);
        return getActivityCount(countQuery, conditions);
    }

    @Override
    public Mono<Long> getDependentActivitiesCount(final OffsetDateTime beginDate,
                                                  final OffsetDateTime endDate,
                                                  final Long datasourceId,
                                                  final Long namespaceId,
                                                  final List<Long> tagIds,
                                                  final List<Long> userIds,
                                                  final List<String> usernames,
                                                  final ActivityEventTypeDto eventType,
                                                  final List<String> oddrns) {
        final var countQuery = DSL.selectCount()
            .from(ACTIVITY)
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(ACTIVITY.DATA_ENTITY_ID))
            .leftJoin(USER_OWNER_MAPPING)
            .on(USER_OWNER_MAPPING.OIDC_USERNAME.eq(ACTIVITY.CREATED_BY)
                .and(USER_OWNER_MAPPING.DELETED_AT.isNull()));
        addJoins(countQuery, datasourceId, namespaceId);
        final List<Condition> conditions = getCommonConditions(beginDate, endDate, datasourceId, namespaceId, tagIds,
            List.of(), userIds, usernames, eventType);
        conditions.add(DATA_ENTITY.ODDRN.in(oddrns));
        return getActivityCount(countQuery, conditions);
    }

    @Override
    public Mono<Page<AssociatedOwnerDto>> getActivityUsers(final Integer page, final Integer size,
                                                           final String query) {
        // The filterable identities are the DISTINCT actor usernames recorded on the activity rows
        // (ACTIVITY.CREATED_BY) — NOT the owner directory. We paginate the distinct usernames first, then
        // left-join the CURRENT owner binding for a friendly display label only. The filter itself keys on
        // the username (getCommonConditions usernames branch), so an actor with no owner mapping is still
        // listable and selectable (#1657).
        final Select<? extends Record> distinctUsers = jooqQueryHelper.paginate(
            DSL.selectDistinct(ACTIVITY.CREATED_BY)
                .from(ACTIVITY)
                .where(ACTIVITY.CREATED_BY.isNotNull())
                .and(StringUtils.isBlank(query)
                    ? DSL.noCondition()
                    : ACTIVITY.CREATED_BY.containsIgnoreCase(query)),
            List.of(new OrderByField(ACTIVITY.CREATED_BY, SortOrder.ASC)),
            (page - 1) * size,
            size);

        final Table<? extends Record> usersCte = distinctUsers.asTable("activity_users");

        final var resultQuery = DSL.with(usersCte.getName())
            .as(distinctUsers)
            .select(usersCte.fields())
            .select(OWNER.fields())
            .from(usersCte)
            .leftJoin(USER_OWNER_MAPPING)
            .on(USER_OWNER_MAPPING.OIDC_USERNAME.eq(usersCte.field(ACTIVITY.CREATED_BY))
                .and(USER_OWNER_MAPPING.DELETED_AT.isNull()))
            .leftJoin(OWNER).on(OWNER.ID.eq(USER_OWNER_MAPPING.OWNER_ID));

        return jooqReactiveOperations.flux(resultQuery)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                this::mapRecordToAssociatedOwnerDto,
                fetchActivityUsersCount(query)));
    }

    private SelectJoinStep<?> buildBaseQuery(final Long datasourceId, final Long namespaceId) {
        final List<Field<?>> selectFields = Stream
            .of(
                ACTIVITY.fields(),
                DATA_ENTITY.fields(),
                OWNER.fields()
            )
            .flatMap(Arrays::stream).toList();
        final var query = DSL.select(selectFields)
            .from(ACTIVITY)
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(ACTIVITY.DATA_ENTITY_ID))
            .leftJoin(USER_OWNER_MAPPING)
            .on(USER_OWNER_MAPPING.OIDC_USERNAME.eq(ACTIVITY.CREATED_BY)
                .and(USER_OWNER_MAPPING.DELETED_AT.isNull()))
            .leftJoin(OWNER).on(OWNER.ID.eq(USER_OWNER_MAPPING.OWNER_ID));
        return addJoins(query, datasourceId, namespaceId);
    }

    private SelectJoinStep<?> addJoins(final SelectJoinStep<?> query,
                                       final Long datasourceId, final Long namespaceId) {
        if (datasourceId != null || namespaceId != null) {
            query.leftJoin(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID));
            if (namespaceId != null) {
                query.leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_ENTITY.NAMESPACE_ID)
                    .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID)));
            }
        }
        // tagIds/ownerIds are intentionally NOT joined here: a LEFT JOIN against the one-to-many
        // TAG_TO_DATA_ENTITY / OWNERSHIP tables multiplies every activity row by (matching tags) x
        // (matching owners). They are applied as EXISTS semi-joins in getCommonConditions, which filter
        // without fanning out the row count — fixing the list query AND every count method (PLT-176).
        return query;
    }

    private List<Condition> getCommonConditions(final OffsetDateTime beginDate,
                                                final OffsetDateTime endDate,
                                                final Long datasourceId,
                                                final Long namespaceId,
                                                final List<Long> tagIds,
                                                final List<Long> ownerIds,
                                                final List<Long> userIds,
                                                final List<String> usernames,
                                                final ActivityEventTypeDto eventType) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(ACTIVITY.CREATED_AT.greaterOrEqual(DateTimeUtil.mapUTCDateTime(beginDate)));
        conditions.add(ACTIVITY.CREATED_AT.lessThan(DateTimeUtil.mapUTCDateTime(endDate)));
        if (eventType != null) {
            conditions.add(ACTIVITY.EVENT_TYPE.eq(eventType.name()));
        }
        if (datasourceId != null) {
            conditions.add(DATA_SOURCE.ID.eq(datasourceId));
        }
        if (namespaceId != null) {
            conditions.add(NAMESPACE.ID.eq(namespaceId));
        }
        if (CollectionUtils.isNotEmpty(tagIds)) {
            conditions.add(DSL.exists(DSL.selectOne()
                .from(TAG_TO_DATA_ENTITY)
                .where(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
                .and(TAG_TO_DATA_ENTITY.TAG_ID.in(tagIds))));
        }
        if (CollectionUtils.isNotEmpty(ownerIds)) {
            conditions.add(DSL.exists(DSL.selectOne()
                .from(OWNERSHIP)
                .where(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
                .and(OWNERSHIP.OWNER_ID.in(ownerIds))));
        }
        // DEPRECATED (#1657): the user_ids filter resolves the actor through the present-time
        // USER_OWNER_MAPPING, so it misses actors with no mapping and re-attributes history whenever an
        // association changes. Retained for backward compatibility (the parameter is marked deprecated in
        // the OpenAPI spec) and slated for removal on a later release train. The usernames branch below is
        // the correct actor filter — it keys on the immutable identity recorded on the activity row.
        if (CollectionUtils.isNotEmpty(userIds)) {
            conditions.add(USER_OWNER_MAPPING.OWNER_ID.in(userIds));
            conditions.add(USER_OWNER_MAPPING.DELETED_AT.isNull());
        }
        if (CollectionUtils.isNotEmpty(usernames)) {
            conditions.add(ACTIVITY.CREATED_BY.in(usernames));
        }
        return conditions;
    }

    private Flux<ActivityDto> findActivities(final SelectJoinStep<?> baseQuery,
                                             final List<Condition> conditions,
                                             final Long lastEventId,
                                             final OffsetDateTime lastEventDateTime,
                                             final Integer size) {
        if (lastEventDateTime != null && lastEventId != null) {
            final LocalDateTime truncated = DateTimeUtil.mapUTCDateTime(lastEventDateTime)
                .truncatedTo(ChronoUnit.SECONDS);
            conditions.add(
                row(trunc(ACTIVITY.CREATED_AT, DatePart.SECOND), ACTIVITY.ID).lessThan(truncated, lastEventId));
        }
        final var finalQuery = baseQuery.where(conditions)
            .orderBy(ACTIVITY.CREATED_AT.desc(), ACTIVITY.ID.desc())
            .limit(size);
        return jooqReactiveOperations.flux(finalQuery)
            .map(this::mapDto);
    }

    private Mono<Long> getActivityCount(final SelectJoinStep<?> baseQuery,
                                        final List<Condition> conditions) {
        final var whereStep = baseQuery.where(conditions);
        return jooqReactiveOperations.mono(whereStep)
            .map(r -> r.into(Long.class));
    }

    private ActivityDto mapDto(final Record r) {
        final ActivityPojo activity = jooqRecordHelper.extractRelation(r, ACTIVITY, ActivityPojo.class);
        final DataEntityPojo dataEntity = jooqRecordHelper.extractRelation(r, DATA_ENTITY, DataEntityPojo.class);
        final OwnerPojo user = jooqRecordHelper.extractRelation(r, OWNER, OwnerPojo.class);
        return new ActivityDto(activity, user, dataEntity);
    }

    private AssociatedOwnerDto mapRecordToAssociatedOwnerDto(final Record r) {
        return new AssociatedOwnerDto(
            r.get(ACTIVITY.CREATED_BY, String.class),
            jooqRecordHelper.extractRelation(r, OWNER, OwnerPojo.class),
            null);
    }

    private Mono<Long> fetchActivityUsersCount(final String query) {
        final SelectConditionStep<Record1<Integer>> count = DSL
            .select(DSL.countDistinct(ACTIVITY.CREATED_BY))
            .from(ACTIVITY)
            .where(ACTIVITY.CREATED_BY.isNotNull())
            .and(StringUtils.isBlank(query)
                ? DSL.noCondition()
                : ACTIVITY.CREATED_BY.containsIgnoreCase(query));

        return jooqReactiveOperations.mono(count)
            .map(r -> r.component1().longValue());
    }
}
