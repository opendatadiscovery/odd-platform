package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ActivityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.ActivityRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

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

    @Override
    public Mono<ActivityPojo> save(final ActivityPojo pojo) {
        final ActivityRecord record = jooqReactiveOperations.newRecord(ACTIVITY, pojo);
        return jooqReactiveOperations.mono(DSL.insertInto(ACTIVITY).set(record).returning())
            .map(r -> r.into(ACTIVITY).into(ActivityPojo.class));
    }

    @Override
    public Flux<ActivityDto> findAllActivities(final LocalDate beginDate,
                                               final LocalDate endDate,
                                               final Integer size,
                                               final Long datasourceId,
                                               final Long namespaceId,
                                               final List<Long> tagIds,
                                               final List<Long> ownerIds,
                                               final List<Long> userIds,
                                               final ActivityEventTypeDto eventType,
                                               final Long lastEventId,
                                               final OffsetDateTime lastEventDateTime) {
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
            .leftJoin(USER_OWNER_MAPPING).on(USER_OWNER_MAPPING.OIDC_USERNAME.eq(ACTIVITY.CREATED_BY))
            .leftJoin(OWNER).on(OWNER.ID.eq(USER_OWNER_MAPPING.OWNER_ID));
        if (datasourceId != null || namespaceId != null) {
            query.leftJoin(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID));
            if (namespaceId != null) {
                query.leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_ENTITY.NAMESPACE_ID)
                    .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID)));
            }
        }
        if (CollectionUtils.isNotEmpty(tagIds)) {
            query.leftJoin(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(DATA_ENTITY.ID));
        }
        if (CollectionUtils.isNotEmpty(ownerIds)) {
            query.leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID));
        }
        if (CollectionUtils.isNotEmpty(userIds)) {
            query.leftJoin(USER_OWNER_MAPPING).on(USER_OWNER_MAPPING.OIDC_USERNAME.eq(ACTIVITY.CREATED_BY));
        }
        final List<Condition> conditions = getConditions(beginDate, endDate, datasourceId, namespaceId, tagIds,
            ownerIds, userIds, eventType);
        final var whereStep = query.where(conditions)
            .orderBy(ACTIVITY.CREATED_AT.desc(), ACTIVITY.ID.desc());
        if (lastEventDateTime != null && lastEventId != null) {
            whereStep.seek(lastEventDateTime.toLocalDateTime(), lastEventId);
        }
        whereStep.limit(size);
        return jooqReactiveOperations.flux(whereStep)
            .map(this::mapDto);
    }

    @Override
    public Flux<ActivityDto> findMyActivities(final LocalDate beginDate,
                                              final LocalDate endDate,
                                              final Integer size,
                                              final Long datasourceId,
                                              final Long namespaceId,
                                              final List<Long> tagIds,
                                              final List<Long> ownerIds,
                                              final List<Long> userIds,
                                              final ActivityEventTypeDto eventType,
                                              final Long currentOwnerId,
                                              final Long lastEventId,
                                              final OffsetDateTime lastEventDateTime) {
        return null;
    }

    @Override
    public Flux<ActivityDto> findUpstreamActivities() {
        return null;
    }

    @Override
    public Flux<ActivityDto> findDownstreamActivities() {
        return null;
    }

    @Override
    public Flux<ActivityDto> findDataEntityActivities() {
        return null;
    }

    private List<Condition> getConditions(final LocalDate beginDate,
                                          final LocalDate endDate,
                                          final Long datasourceId,
                                          final Long namespaceId,
                                          final List<Long> tagIds,
                                          final List<Long> ownerIds,
                                          final List<Long> userIds,
                                          final ActivityEventTypeDto eventType) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(ACTIVITY.CREATED_AT.greaterOrEqual(beginDate.atStartOfDay()));
        conditions.add(ACTIVITY.CREATED_AT.lessThan(endDate.atStartOfDay()));
//        if (dataEntityId != null) {
//            conditions.add(ACTIVITY.DATA_ENTITY_ID.eq(dataEntityId));
//        }
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
            conditions.add(TAG_TO_DATA_ENTITY.TAG_ID.in(tagIds));
        }
        if (CollectionUtils.isNotEmpty(ownerIds)) {
            conditions.add(OWNERSHIP.OWNER_ID.in(ownerIds));
        }
        if (CollectionUtils.isNotEmpty(userIds)) {
            conditions.add(USER_OWNER_MAPPING.OWNER_ID.in(userIds));
        }
        return conditions;
    }

    private ActivityDto mapDto(final Record r) {
        final ActivityPojo activity = jooqRecordHelper.extractRelation(r, ACTIVITY, ActivityPojo.class);
        final DataEntityPojo dataEntity = jooqRecordHelper.extractRelation(r, DATA_ENTITY, DataEntityPojo.class);
        final OwnerPojo user = jooqRecordHelper.extractRelation(r, OWNER, OwnerPojo.class);
        return new ActivityDto(activity, user, dataEntity);
    }
}