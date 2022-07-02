package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityEventType;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityType;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ActivityPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.ActivityRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.ACTIVITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;

@Repository
@RequiredArgsConstructor
public class ReactiveActivityRepositoryImpl implements ReactiveActivityRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Mono<ActivityPojo> save(final ActivityPojo pojo) {
        final ActivityRecord record = jooqReactiveOperations.newRecord(ACTIVITY, pojo);
        return jooqReactiveOperations.mono(DSL.insertInto(ACTIVITY).set(record).returning())
            .map(r -> r.into(ACTIVITY).into(ActivityPojo.class));
    }

    @Override
    public Mono<List<ActivityPojo>> findActivities(final LocalDate beginDate, final LocalDate endDate,
                                                   final Integer size,
                                                   final Long datasourceId,
                                                   final Long namespaceId,
                                                   final List<Long> tagIds,
                                                   final List<Long> ownerIds,
                                                   final List<Long> userIds,
                                                   final ActivityType type,
                                                   final Long dataEntityId,
                                                   final ActivityEventType eventType,
                                                   final Long lastEventId,
                                                   final OffsetDateTime lastEventDateTime) {
        final var query = DSL.select(ACTIVITY.fields())
            .from(ACTIVITY);
        if (datasourceId != null || namespaceId != null
            || CollectionUtils.isNotEmpty(tagIds) || CollectionUtils.isNotEmpty(ownerIds)) {
            query.join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(ACTIVITY.DATA_ENTITY_ID));
            if (datasourceId != null || namespaceId != null) {
                query.join(DATA_SOURCE)
                    .on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID).and(DATA_SOURCE.ID.eq(datasourceId)));
            }
//            if (namespaceId != null) {
//            }
            if (CollectionUtils.isNotEmpty(tagIds)) {
                query.join(TAG_TO_DATA_ENTITY)
                    .on(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(DATA_ENTITY.ID).and(TAG_TO_DATA_ENTITY.TAG_ID.in(tagIds)));
            }
            if (CollectionUtils.isNotEmpty(ownerIds)) {
                query.join(OWNERSHIP)
                    .on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID).and(OWNERSHIP.OWNER_ID.in(ownerIds)));
            }
        }
        final var whereStep = query.where(ACTIVITY.CREATED_AT.greaterOrEqual(beginDate.atStartOfDay())
                .and(ACTIVITY.CREATED_AT.lessThan(endDate.atStartOfDay())))
            .orderBy(ACTIVITY.CREATED_AT.desc(), ACTIVITY.ID.desc());
        if (lastEventDateTime != null && lastEventId != null) {
            whereStep.seek(lastEventDateTime.toLocalDateTime(), lastEventId);
        }
        whereStep.limit(size);
        return jooqReactiveOperations.flux(whereStep)
            .map(r -> r.into(ActivityPojo.class))
            .collectList();
    }
}