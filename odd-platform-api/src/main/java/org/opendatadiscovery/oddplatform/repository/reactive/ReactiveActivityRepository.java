package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.OffsetDateTime;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ActivityPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveActivityRepository {
    Mono<ActivityPojo> saveReturning(final ActivityPojo pojo);

    Mono<Void> save(final List<ActivityPojo> pojos);

    Flux<ActivityDto> findAllActivities(final OffsetDateTime beginDate,
                                        final OffsetDateTime endDate,
                                        final Integer size,
                                        final Long datasourceId,
                                        final Long namespaceId,
                                        final List<Long> tagIds,
                                        final List<Long> ownerIds,
                                        final List<Long> userIds,
                                        final ActivityEventTypeDto eventType,
                                        final Long lastEventId,
                                        final OffsetDateTime lastEventDateTime);

    Flux<ActivityDto> findMyActivities(final OffsetDateTime beginDate,
                                       final OffsetDateTime endDate,
                                       final Integer size,
                                       final Long datasourceId,
                                       final Long namespaceId,
                                       final List<Long> tagIds,
                                       final List<Long> userIds,
                                       final ActivityEventTypeDto eventType,
                                       final Long currentOwnerId,
                                       final Long lastEventId,
                                       final OffsetDateTime lastEventDateTime);

    Flux<ActivityDto> findDependentActivities(final OffsetDateTime beginDate,
                                              final OffsetDateTime endDate,
                                              final Integer size,
                                              final Long datasourceId,
                                              final Long namespaceId,
                                              final List<Long> tagIds,
                                              final List<Long> userIds,
                                              final ActivityEventTypeDto eventType,
                                              final List<String> oddrns,
                                              final Long lastEventId,
                                              final OffsetDateTime lastEventDateTime);

    Flux<ActivityDto> findDataEntityActivities(final OffsetDateTime beginDate,
                                               final OffsetDateTime endDate,
                                               final Integer size,
                                               final Long dataEntityId,
                                               final List<Long> userIds,
                                               final ActivityEventTypeDto eventType,
                                               final Long lastEventId,
                                               final OffsetDateTime lastEventDateTime);

    Mono<Long> getTotalActivitiesCount(final OffsetDateTime beginDate,
                                       final OffsetDateTime endDate,
                                       final Long datasourceId,
                                       final Long namespaceId,
                                       final List<Long> tagIds,
                                       final List<Long> ownerIds,
                                       final List<Long> userIds,
                                       final ActivityEventTypeDto eventType);

    Mono<Long> getMyObjectsActivitiesCount(final OffsetDateTime beginDate,
                                           final OffsetDateTime endDate,
                                           final Long datasourceId,
                                           final Long namespaceId,
                                           final List<Long> tagIds,
                                           final List<Long> userIds,
                                           final ActivityEventTypeDto eventType,
                                           final Long currentOwnerId);

    Mono<Long> getDependentActivitiesCount(final OffsetDateTime beginDate,
                                           final OffsetDateTime endDate,
                                           final Long datasourceId,
                                           final Long namespaceId,
                                           final List<Long> tagIds,
                                           final List<Long> userIds,
                                           final ActivityEventTypeDto eventType,
                                           final List<String> oddrns);
}
