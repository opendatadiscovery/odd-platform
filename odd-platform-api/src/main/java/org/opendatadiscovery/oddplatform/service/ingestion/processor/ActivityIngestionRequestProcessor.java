package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityCreateEvent;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.service.activity.ActivityService;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import static java.util.Collections.emptyMap;
import static reactor.function.TupleUtils.function;

@Component
@RequiredArgsConstructor
public class ActivityIngestionRequestProcessor implements IngestionRequestProcessor {
    private final ActivityService activityService;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        return Mono.zip(
                activityService.getContextInfo(emptyMap(), ActivityEventTypeDto.DATA_ENTITY_CREATED),
                activityService.getUpdatedInfo(emptyMap(), request.getNewIds(),
                    ActivityEventTypeDto.DATA_ENTITY_CREATED)
            )
            .map(function(this::createActivityEvents))
            .flatMap(activityService::createActivityEvents);
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return CollectionUtils.isNotEmpty(request.getNewEntities());
    }

    @Override
    public IngestionProcessingPhase getPhase() {
        return IngestionProcessingPhase.FINALIZING;
    }

    private List<ActivityCreateEvent> createActivityEvents(final ActivityContextInfo ctx,
                                                           final Map<Long, String> dtoMap) {
        return dtoMap.entrySet()
            .stream()
            .map(e -> ActivityCreateEvent.builder()
                .dataEntityId(e.getKey())
                .oldState(ctx.getOldState())
                .eventType(ActivityEventTypeDto.DATA_ENTITY_CREATED)
                .newState(e.getValue())
                .systemEvent(true)
                .build())
            .toList();
    }
}
