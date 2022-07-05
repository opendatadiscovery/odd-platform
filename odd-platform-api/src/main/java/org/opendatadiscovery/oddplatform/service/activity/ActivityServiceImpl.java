package org.opendatadiscovery.oddplatform.service.activity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.Activity;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityCountInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityEventType;
import org.opendatadiscovery.oddplatform.api.contract.model.ActivityType;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityCreateEvent;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.mapper.ActivityMapper;
import org.opendatadiscovery.oddplatform.repository.DataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveActivityRepository;
import org.opendatadiscovery.oddplatform.service.activity.handler.ActivityHandler;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import static reactor.function.TupleUtils.function;

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
    public Flux<Activity> getActivityList(final LocalDate beginDate,
                                          final LocalDate endDate,
                                          final Integer size,
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
        if (type == null) {
            return fetchAllActivities(beginDate, endDate, size, datasourceId, namespaceId, tagIds, ownerIds,
                userIds, eventTypeDto, lastEventId, lastEventDateTime);
        }
        return switch (type) {
            case MY_OBJECTS -> fetchMyActivities(beginDate, endDate, size, datasourceId, namespaceId, tagIds, userIds,
                eventTypeDto, lastEventId, lastEventDateTime);
            case DOWNSTREAM -> fetchDependentActivities(beginDate, endDate, size, datasourceId, namespaceId, tagIds,
                userIds, eventTypeDto, lastEventId, lastEventDateTime, LineageStreamKind.DOWNSTREAM);
            case UPSTREAM -> fetchDependentActivities(beginDate, endDate, size, datasourceId, namespaceId, tagIds,
                userIds, eventTypeDto, lastEventId, lastEventDateTime, LineageStreamKind.UPSTREAM);
            case ALL -> fetchAllActivities(beginDate, endDate, size, datasourceId, namespaceId, tagIds, ownerIds,
                userIds, eventTypeDto, lastEventId, lastEventDateTime);
        };
    }

    @Override
    public Flux<Activity> getDataEntityActivityList(final LocalDate beginDate,
                                                    final LocalDate endDate,
                                                    final Integer size,
                                                    final Long dataEntityId,
                                                    final List<Long> userIds,
                                                    final ActivityEventType eventType,
                                                    final Long lastEventId,
                                                    final OffsetDateTime lastEventDateTime) {
        if (beginDate == null || endDate == null) {
            return Flux.error(new IllegalArgumentException("Begin date and end date can't be null"));
        }
        final ActivityEventTypeDto eventTypeDto =
            eventType != null ? ActivityEventTypeDto.valueOf(eventType.name()) : null;
        return activityRepository.findDataEntityActivities(beginDate, endDate, size, dataEntityId, userIds,
                eventTypeDto, lastEventId, lastEventDateTime)
            .map(activityMapper::mapToActivity);
    }

    @Override
    public Mono<ActivityCountInfo> getActivityCounts(final LocalDate beginDate,
                                                     final LocalDate endDate,
                                                     final Long datasourceId,
                                                     final Long namespaceId,
                                                     final List<Long> tagIds,
                                                     final List<Long> ownerIds,
                                                     final List<Long> userIds,
                                                     final ActivityEventType eventType) {
        final ActivityEventTypeDto eventTypeDto =
            eventType != null ? ActivityEventTypeDto.valueOf(eventType.name()) : null;
        final Mono<Long> totalCount =
            getTotalCount(beginDate, endDate, datasourceId, namespaceId, tagIds, ownerIds, userIds, eventTypeDto);
        final Mono<Long> myObjectActivitiesCount =
            getMyObjectActivitiesCount(beginDate, endDate, datasourceId, namespaceId,
                tagIds, userIds, eventTypeDto);
        final Mono<Long> downstreamActivitiesCount = getDependentActivitiesCount(beginDate, endDate, datasourceId,
            namespaceId, tagIds, userIds, eventTypeDto, LineageStreamKind.DOWNSTREAM);
        final Mono<Long> upstreamActivitiesCount = getDependentActivitiesCount(beginDate, endDate, datasourceId,
            namespaceId, tagIds, userIds, eventTypeDto, LineageStreamKind.UPSTREAM);
        return Mono.zip(totalCount, myObjectActivitiesCount, downstreamActivitiesCount, upstreamActivitiesCount)
            .map(function(
                (total, myObjectsCount, downstreamCount, upstreamCount) -> new ActivityCountInfo()
                    .totalCount(total)
                    .myObjectsCount(myObjectsCount)
                    .downstreamCount(downstreamCount)
                    .upstreamCount(upstreamCount)
            ));
    }

    private Flux<Activity> fetchAllActivities(final LocalDate beginDate,
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
        return activityRepository.findAllActivities(beginDate, endDate, size, datasourceId, namespaceId, tagIds,
                ownerIds, userIds, eventType, lastEventId, lastEventDateTime)
            .map(activityMapper::mapToActivity);
    }

    private Flux<Activity> fetchMyActivities(final LocalDate beginDate,
                                             final LocalDate endDate,
                                             final Integer size,
                                             final Long datasourceId,
                                             final Long namespaceId,
                                             final List<Long> tagIds,
                                             final List<Long> userIds,
                                             final ActivityEventTypeDto eventType,
                                             final Long lastEventId,
                                             final OffsetDateTime lastEventDateTime) {
        return authIdentityProvider.fetchAssociatedOwner()
            .flatMapMany(owner -> activityRepository.findMyActivities(beginDate, endDate, size, datasourceId,
                namespaceId, tagIds, userIds, eventType, owner.getId(), lastEventId, lastEventDateTime))
            .map(activityMapper::mapToActivity)
            .switchIfEmpty(Flux.empty());
    }

    private Flux<Activity> fetchDependentActivities(final LocalDate beginDate,
                                                    final LocalDate endDate,
                                                    final Integer size,
                                                    final Long datasourceId,
                                                    final Long namespaceId,
                                                    final List<Long> tagIds,
                                                    final List<Long> userIds,
                                                    final ActivityEventTypeDto eventType,
                                                    final Long lastEventId,
                                                    final OffsetDateTime lastEventDateTime,
                                                    final LineageStreamKind lineageStreamKind) {
        return authIdentityProvider.fetchAssociatedOwner()
            .map(owner -> dataEntityRepository.listOddrnsByOwner(owner.getId(), lineageStreamKind))
            .flatMapMany(oddrns -> activityRepository.findDependentActivities(beginDate, endDate, size, datasourceId,
                namespaceId, tagIds, userIds, eventType, oddrns, lastEventId, lastEventDateTime))
            .map(activityMapper::mapToActivity)
            .switchIfEmpty(Flux.empty())
            .subscribeOn(Schedulers.boundedElastic());
    }

    private Mono<Long> getTotalCount(final LocalDate beginDate,
                                     final LocalDate endDate,
                                     final Long datasourceId,
                                     final Long namespaceId,
                                     final List<Long> tagIds,
                                     final List<Long> ownerIds,
                                     final List<Long> userIds,
                                     final ActivityEventTypeDto eventType) {
        return activityRepository.getTotalActivitiesCount(beginDate, endDate, datasourceId, namespaceId, tagIds,
                ownerIds, userIds, eventType)
            .defaultIfEmpty(0L);
    }

    private Mono<Long> getMyObjectActivitiesCount(final LocalDate beginDate,
                                                  final LocalDate endDate,
                                                  final Long datasourceId,
                                                  final Long namespaceId,
                                                  final List<Long> tagIds,
                                                  final List<Long> userIds,
                                                  final ActivityEventTypeDto eventType) {
        return authIdentityProvider.fetchAssociatedOwner()
            .flatMap(
                owner -> activityRepository.getMyObjectsActivitiesCount(beginDate, endDate, datasourceId, namespaceId,
                    tagIds, userIds, eventType, owner.getId()))
            .defaultIfEmpty(0L);
    }

    private Mono<Long> getDependentActivitiesCount(final LocalDate beginDate,
                                                   final LocalDate endDate,
                                                   final Long datasourceId,
                                                   final Long namespaceId,
                                                   final List<Long> tagIds,
                                                   final List<Long> userIds,
                                                   final ActivityEventTypeDto eventType,
                                                   final LineageStreamKind lineageStreamKind) {
        return authIdentityProvider.fetchAssociatedOwner()
            .map(owner -> dataEntityRepository.listOddrnsByOwner(owner.getId(), lineageStreamKind))
            .flatMap(oddrns -> activityRepository.getDependentActivitiesCount(beginDate, endDate, datasourceId,
                namespaceId, tagIds, userIds, eventType, oddrns))
            .defaultIfEmpty(0L)
            .subscribeOn(Schedulers.boundedElastic());
    }

    private ActivityHandler getActivityHandler(final ActivityEventTypeDto eventType) {
        return handlers.stream().filter(handler -> handler.isHandle(eventType))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Can't find handler for event type " + eventType.name()));
    }
}
