package org.opendatadiscovery.oddplatform.service.activity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityCreateEvent;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventType;
import org.opendatadiscovery.oddplatform.mapper.ActivityMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveActivityRepository;
import org.opendatadiscovery.oddplatform.service.activity.handler.ActivityHandler;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {
    private final ActivityTablePartitionManager activityTablePartitionManager;
    private final ReactiveActivityRepository activityRepository;
    private final AuthIdentityProvider authIdentityProvider;
    private final ActivityMapper activityMapper;
    private final List<ActivityHandler> handlers;

    @Override
    public Mono<Void> createActivityEvent(final ActivityCreateEvent event) {
        final LocalDateTime activityCreateTime = LocalDateTime.now();
        return activityTablePartitionManager.createPartitionIfNotExists(activityCreateTime.toLocalDate())
            .then(getUsername(event.getEventType()))
            .defaultIfEmpty("")
            .map(username -> activityMapper.mapToPojo(event, activityCreateTime, username))
            .flatMap(activityRepository::save)
            .then();
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters,
                                                    final ActivityEventType eventType) {
        return getActivityHandler(eventType).getContextInfo(parameters);
    }

    @Override
    public Mono<String> getUpdatedInfo(final Map<String, Object> parameters,
                                       final Long dataEntityId,
                                       final ActivityEventType eventType) {
        return getActivityHandler(eventType).getUpdatedState(parameters, dataEntityId);
    }

    private Mono<String> getUsername(final ActivityEventType eventType) {
        if (eventType.isSystemEvent()) {
            return Mono.just("system");
        }
        return authIdentityProvider.getUsername();
    }

    private ActivityHandler getActivityHandler(final ActivityEventType eventType) {
        return handlers.stream().filter(handler -> handler.isHandle(eventType))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Can't find handler for event type " + eventType.name()));
    }
}
