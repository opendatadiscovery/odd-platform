package org.opendatadiscovery.oddplatform.controller;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.ActivityApi;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityEventType;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityList;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class ActivityController implements ActivityApi {

    @Override
    public Mono<ResponseEntity<ActivityList>> getActivity(final LocalDate beginDate, final LocalDate endDate,
                                                          final Integer size, final Long datasourceId,
                                                          final Long namespaceId, final List<Long> tagIds,
                                                          final List<Long> ownerIds, final List<Long> userIds,
                                                          final ActivityType type, final Long dataEntityId,
                                                          final ActivityEventType eventType,
                                                          final OffsetDateTime lastEventDateTime,
                                                          final ServerWebExchange exchange) {
        return ActivityApi.super.getActivity(beginDate, endDate, size, datasourceId, namespaceId, tagIds, ownerIds,
            userIds, type, dataEntityId, eventType, lastEventDateTime, exchange);
    }

    @Override
    public Mono<ResponseEntity<Flux<ActivityEventType>>> getActivityEventTypes(final ServerWebExchange exchange) {
        return ActivityApi.super.getActivityEventTypes(exchange);
    }
}
