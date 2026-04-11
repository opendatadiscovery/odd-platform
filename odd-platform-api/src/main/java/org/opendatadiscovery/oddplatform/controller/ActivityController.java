package org.opendatadiscovery.oddplatform.controller;

import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.ActivityApi;
import org.opendatadiscovery.oddplatform.api.contract.model.Activity;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityCountInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityEventType;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityType;
import org.opendatadiscovery.oddplatform.service.activity.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class ActivityController implements ActivityApi {
    private final ActivityService activityService;

    @Override
    public Mono<ResponseEntity<Flux<Activity>>> getActivity(final OffsetDateTime beginDate,
                                                            final OffsetDateTime endDate,
                                                            final Integer size,
                                                            final Long datasourceId,
                                                            final Long namespaceId,
                                                            final List<Long> tagIds,
                                                            final List<Long> ownerIds,
                                                            final List<Long> userIds,
                                                            final ActivityType type,
                                                            final ActivityEventType eventType,
                                                            final Long lasEventId,
                                                            final OffsetDateTime lastEventDateTime,
                                                            final ServerWebExchange exchange) {
        return Mono.just(
                activityService.getActivityList(beginDate, endDate, size, datasourceId, namespaceId, tagIds, ownerIds,
                    userIds, type, eventType, lasEventId, lastEventDateTime))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<ActivityCountInfo>> getActivityCounts(final OffsetDateTime beginDate,
                                                                     final OffsetDateTime endDate,
                                                                     final Long datasourceId,
                                                                     final Long namespaceId,
                                                                     final List<Long> tagIds,
                                                                     final List<Long> ownerIds,
                                                                     final List<Long> userIds,
                                                                     final ActivityEventType eventType,
                                                                     final ServerWebExchange exchange) {
        return activityService.getActivityCounts(beginDate, endDate, datasourceId, namespaceId,
                tagIds, ownerIds, userIds, eventType)
            .map(ResponseEntity::ok);
    }
}
