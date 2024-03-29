package org.opendatadiscovery.oddplatform.service.activity;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.api.contract.model.Activity;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityCountInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityEventType;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityType;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityCreateEvent;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ActivityService {
    Mono<Void> createActivityEvent(final ActivityCreateEvent activityCreateEvent);

    Mono<Void> createActivityEvents(final List<ActivityCreateEvent> activityCreateEvents);

    Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters,
                                             final ActivityEventTypeDto eventType);

    Mono<Map<Long, String>> getUpdatedInfo(final Map<String, Object> parameters,
                                           final List<Long> dataEntityIds,
                                           final ActivityEventTypeDto eventType);

    Mono<String> getUpdatedInfo(final Map<String, Object> parameters,
                                final Long dataEntityId,
                                final ActivityEventTypeDto eventType);

    Flux<Activity> getActivityList(final OffsetDateTime beginDate,
                                   final OffsetDateTime endDate,
                                   final Integer size,
                                   final Long datasourceId,
                                   final Long namespaceId,
                                   final List<Long> tagIds,
                                   final List<Long> ownerIds,
                                   final List<Long> userIds,
                                   final ActivityType type,
                                   final ActivityEventType eventType,
                                   final Long lastEventId,
                                   final OffsetDateTime lastEventDateTime);

    Flux<Activity> getDataEntityActivityList(final OffsetDateTime beginDate,
                                             final OffsetDateTime endDate,
                                             final Integer size,
                                             final Long dataEntityId,
                                             final List<Long> userIds,
                                             final ActivityEventType eventType,
                                             final Long lastEventId,
                                             final OffsetDateTime lastEventDateTime);

    Mono<ActivityCountInfo> getActivityCounts(final OffsetDateTime beginDate,
                                              final OffsetDateTime endDate,
                                              final Long datasourceId,
                                              final Long namespaceId,
                                              final List<Long> tagIds,
                                              final List<Long> ownerIds,
                                              final List<Long> userIds,
                                              final ActivityEventType eventType);
}
