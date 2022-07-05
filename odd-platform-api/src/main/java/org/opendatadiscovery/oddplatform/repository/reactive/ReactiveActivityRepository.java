package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ActivityPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveActivityRepository {
    Mono<ActivityPojo> save(final ActivityPojo pojo);

    Flux<ActivityDto> findAllActivities(final LocalDate beginDate,
                                        final LocalDate endDate,
                                        final Integer size,
                                        final Long datasourceId,
                                        final Long namespaceId,
                                        final List<Long> tagIds,
                                        final List<Long> ownerIds,
                                        final List<Long> userIds,
                                        final ActivityEventTypeDto eventType,
                                        final Long lastEventId,
                                        final OffsetDateTime lastEventDateTime);

    Flux<ActivityDto> findMyActivities(final LocalDate beginDate,
                                       final LocalDate endDate,
                                       final Integer size,
                                       final Long datasourceId,
                                       final Long namespaceId,
                                       final List<Long> tagIds,
                                       final List<Long> userIds,
                                       final ActivityEventTypeDto eventType,
                                       final Long currentOwnerId,
                                       final Long lastEventId,
                                       final OffsetDateTime lastEventDateTime);

    Flux<ActivityDto> findDependentActivities(final LocalDate beginDate,
                                              final LocalDate endDate,
                                              final Integer size,
                                              final Long datasourceId,
                                              final Long namespaceId,
                                              final List<Long> tagIds,
                                              final List<Long> userIds,
                                              final ActivityEventTypeDto eventType,
                                              final List<String> oddrns,
                                              final Long lastEventId,
                                              final OffsetDateTime lastEventDateTime);

    Flux<ActivityDto> findDataEntityActivities(final LocalDate beginDate,
                                               final LocalDate endDate,
                                               final Integer size,
                                               final Long dataEntityId,
                                               final List<Long> userIds,
                                               final ActivityEventTypeDto eventType,
                                               final Long lastEventId,
                                               final OffsetDateTime lastEventDateTime);

    Mono<Long> getTotalActivitiesCount(final LocalDate beginDate,
                                       final LocalDate endDate,
                                       final Long datasourceId,
                                       final Long namespaceId,
                                       final List<Long> tagIds,
                                       final List<Long> ownerIds,
                                       final List<Long> userIds,
                                       final ActivityEventTypeDto eventType);

    Mono<Long> getMyObjectsActivitiesCount(final LocalDate beginDate,
                                           final LocalDate endDate,
                                           final Long datasourceId,
                                           final Long namespaceId,
                                           final List<Long> tagIds,
                                           final List<Long> userIds,
                                           final ActivityEventTypeDto eventType,
                                           final Long currentOwnerId);

    Mono<Long> getDependentActivitiesCount(final LocalDate beginDate,
                                           final LocalDate endDate,
                                           final Long datasourceId,
                                           final Long namespaceId,
                                           final List<Long> tagIds,
                                           final List<Long> userIds,
                                           final ActivityEventTypeDto eventType,
                                           final List<String> oddrns);
}
