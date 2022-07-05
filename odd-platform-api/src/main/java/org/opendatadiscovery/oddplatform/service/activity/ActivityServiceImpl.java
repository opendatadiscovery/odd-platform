package org.opendatadiscovery.oddplatform.service.activity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.Activity;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityEventType;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityType;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityCreateEvent;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.mapper.ActivityMapper;
import org.opendatadiscovery.oddplatform.repository.DataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveActivityRepository;
import org.opendatadiscovery.oddplatform.service.activity.handler.ActivityHandler;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {
    private final ActivityTablePartitionManager activityTablePartitionManager;
    private final ReactiveActivityRepository activityRepository;
    private final DataEntityRepository dataEntityRepository;
    private final AuthIdentityProvider authIdentityProvider;
    private final ActivityMapper activityMapper;
    private final List<ActivityHandler> handlers;

    @Override
    public Mono<Void> createActivityEvent(final ActivityCreateEvent event) {
        final LocalDateTime activityCreateTime = LocalDateTime.now();
        return activityTablePartitionManager.createPartitionIfNotExists(activityCreateTime.toLocalDate())
            .then(authIdentityProvider.getUsername())
            .map(username -> activityMapper.mapToPojo(event, activityCreateTime, username))
            .switchIfEmpty(Mono.defer(() -> Mono.just(activityMapper.mapToPojo(event, activityCreateTime, null))))
            .flatMap(activityRepository::save)
            .then();
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters,
                                                    final ActivityEventTypeDto eventType) {
        return getActivityHandler(eventType).getContextInfo(parameters);
    }

    @Override
    public Mono<String> getUpdatedInfo(final Map<String, Object> parameters,
                                       final Long dataEntityId,
                                       final ActivityEventTypeDto eventType) {
        return getActivityHandler(eventType).getUpdatedState(parameters, dataEntityId);
    }

    @Override
    public Flux<Activity> getActivityList(final LocalDate beginDate, final LocalDate endDate, final Integer size,
                                          final Long datasourceId,
                                          final Long namespaceId,
                                          final List<Long> tagIds,
                                          final List<Long> ownerIds,
                                          final List<Long> userIds,
                                          final ActivityType type,
                                          final ActivityEventType eventType,
                                          final Long lastEventId,
                                          final OffsetDateTime lastEventDateTime) {
        if (beginDate == null || endDate == null) {
            return Flux.error(new IllegalArgumentException("Begin date and end date can't be null"));
        }
        final ActivityEventTypeDto eventTypeDto =
            eventType != null ? ActivityEventTypeDto.valueOf(eventType.name()) : null;
//        if (type == null) {
//            type = ActivityType.ALL;
//        }
        // todo handle null
        return switch (type) {
            case MY_OBJECTS ->
                fetchMyActivities(beginDate, endDate, size, datasourceId, namespaceId, tagIds, ownerIds, userIds,
                    eventTypeDto, lastEventId, lastEventDateTime);
            case DOWNSTREAM ->
                fetchDownstreamActivities(beginDate, endDate, size, datasourceId, namespaceId, tagIds, ownerIds,
                    userIds, eventTypeDto, lastEventId, lastEventDateTime);
            case UPSTREAM ->
                fetchUpstreamActivities(beginDate, endDate, size, datasourceId, namespaceId, tagIds, ownerIds,
                    userIds, eventTypeDto, lastEventId, lastEventDateTime);
            case ALL -> fetchAllActivities(beginDate, endDate, size, datasourceId, namespaceId, tagIds, ownerIds,
                userIds, eventTypeDto, lastEventId, lastEventDateTime);
        };
    }

    private Flux<Activity> fetchAllActivities(final LocalDate beginDate, final LocalDate endDate, final Integer size,
                                              final Long datasourceId,
                                              final Long namespaceId,
                                              final List<Long> tagIds,
                                              final List<Long> ownerIds,
                                              final List<Long> userIds,
                                              final ActivityEventTypeDto eventType,
                                              final Long lastEventId,
                                              final OffsetDateTime lastEventDateTime) {
        return activityRepository.findAllActivities(beginDate, endDate, size, datasourceId, namespaceId, tagIds,
                ownerIds, userIds, eventType, lastEventId, lastEventDateTime)
            .map(activityMapper::mapToActivity);
    }

    private Flux<Activity> fetchMyActivities(final LocalDate beginDate, final LocalDate endDate, final Integer size,
                                             final Long datasourceId,
                                             final Long namespaceId,
                                             final List<Long> tagIds,
                                             final List<Long> ownerIds,
                                             final List<Long> userIds,
                                             final ActivityEventTypeDto eventType,
                                             final Long lastEventId,
                                             final OffsetDateTime lastEventDateTime) {
        return authIdentityProvider.fetchAssociatedOwner()
            .flatMapMany(owner -> activityRepository.findMyActivities(beginDate, endDate, size, datasourceId,
                namespaceId, tagIds, ownerIds, userIds, eventType, owner.getId(), lastEventId, lastEventDateTime))
            .map(activityMapper::mapToActivity)
            .switchIfEmpty(Flux.empty());
    }

    private Flux<Activity> fetchDownstreamActivities(final LocalDate beginDate, final LocalDate endDate,
                                                     final Integer size,
                                                     final Long datasourceId,
                                                     final Long namespaceId,
                                                     final List<Long> tagIds,
                                                     final List<Long> ownerIds,
                                                     final List<Long> userIds,
                                                     final ActivityEventTypeDto eventType,
                                                     final Long lastEventId,
                                                     final OffsetDateTime lastEventDateTime) {
        return authIdentityProvider.fetchAssociatedOwner()
            .flatMapMany(owner -> activityRepository.findMyActivities(beginDate, endDate, size, datasourceId,
                namespaceId, tagIds, ownerIds, userIds, eventType, owner.getId(), lastEventId, lastEventDateTime))
            .map(activityMapper::mapToActivity)
            .switchIfEmpty(Flux.empty());
    }

    private Flux<Activity> fetchUpstreamActivities(final LocalDate beginDate, final LocalDate endDate,
                                                   final Integer size,
                                                   final Long datasourceId,
                                                   final Long namespaceId,
                                                   final List<Long> tagIds,
                                                   final List<Long> ownerIds,
                                                   final List<Long> userIds,
                                                   final ActivityEventTypeDto eventType,
                                                   final Long lastEventId,
                                                   final OffsetDateTime lastEventDateTime) {
        return Flux.just();
    }

    private ActivityHandler getActivityHandler(final ActivityEventTypeDto eventType) {
        return handlers.stream().filter(handler -> handler.isHandle(eventType))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Can't find handler for event type " + eventType.name()));
    }
}
