package org.opendatadiscovery.oddplatform.service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityStatusEnum;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalDescriptionFormData;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityCreateEvent;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGroupEntityRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGroupParentGroupRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLineageRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityLog;
import org.opendatadiscovery.oddplatform.service.activity.ActivityParameter;
import org.opendatadiscovery.oddplatform.service.activity.ActivityService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.INTERNAL_DESCRIPTION;
import static org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.DescriptionUpdated.DATA_ENTITY_ID;
import static org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.StatusUpdated.DATA_ENTITY_POJO;

@Service
@RequiredArgsConstructor
public class DataEntityInternalStateServiceImpl implements DataEntityInternalStateService {
    private final DataEntityFilledService dataEntityFilledService;
    private final DataEntityStatisticsService dataEntityStatisticsService;
    private final ActivityService activityService;

    private final ReactiveDataEntityRepository dataEntityRepository;
    private final ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;
    private final ReactiveLineageRepository lineageRepository;
    private final ReactiveGroupEntityRelationRepository groupEntityRelationRepository;
    private final ReactiveGroupParentGroupRelationRepository groupParentGroupRelationRepository;

    private final DataEntityMapper dataEntityMapper;

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.DESCRIPTION_UPDATED)
    public Mono<DataEntityPojo> updateDescription(@ActivityParameter(DATA_ENTITY_ID) final long dataEntityId,
                                                  final InternalDescriptionFormData formData) {
        return dataEntityRepository.setInternalDescription(dataEntityId, formData.getInternalDescription())
            .flatMap(pojo -> reactiveSearchEntrypointRepository.updateDataEntityVectors(dataEntityId)
                .thenReturn(pojo))
            .flatMap(pojo -> {
                if (StringUtils.isNotEmpty(pojo.getInternalDescription())) {
                    return dataEntityFilledService.markEntityFilled(dataEntityId, INTERNAL_DESCRIPTION)
                        .thenReturn(pojo);
                } else {
                    return dataEntityFilledService.markEntityUnfilled(dataEntityId, INTERNAL_DESCRIPTION)
                        .thenReturn(pojo);
                }
            });
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> changeStatusForDataEntities(final List<DataEntityPojo> pojos,
                                                  final DataEntityStatus newStatus) {
        final List<Long> ids = pojos.stream().map(DataEntityPojo::getId).toList();
        if (newStatus.getStatus() == DataEntityStatusEnum.DELETED) {
            return getActivityContextInfos(pojos).flatMap(oldStates -> softDeleteDataEntities(pojos)
                .then(Mono.defer(() -> logStatusChangeEvents(oldStates, ids))));
        } else {
            return getActivityContextInfos(pojos).flatMap(oldStates -> Flux.fromIterable(pojos)
                .collectList()
                .flatMap(dataEntityPojos -> {
                    final List<DataEntityPojo> updatedPojos = dataEntityPojos.stream()
                        .map(pojo -> dataEntityMapper.applyStatus(pojo, newStatus))
                        .toList();
                    return dataEntityRepository.bulkUpdate(updatedPojos).then();
                })
                .then(Mono.defer(() -> {
                    final List<DataEntityPojo> entitiesToRestore = pojos.stream()
                        .filter(pojo -> pojo.getStatus().equals(DataEntityStatusDto.DELETED.getId()))
                        .toList();
                    return restore(entitiesToRestore);
                }))
                .then(Mono.defer(() -> logStatusChangeEvents(oldStates, ids))));
        }
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> restoreDeletedDataEntityRelations(final List<DataEntityPojo> deletedPojos) {
        return restore(deletedPojos);
    }

    private Mono<Void> softDeleteDataEntities(final List<DataEntityPojo> pojos) {
        final List<Long> ids = pojos.stream().map(DataEntityPojo::getId).toList();
        final List<String> oddrns = pojos.stream().map(DataEntityPojo::getOddrn).toList();
        return dataEntityRepository.delete(ids)
            .then(Mono.defer(() -> {
                final Map<Integer, Map<Integer, Long>> statistics = new HashMap<>();
                pojos.forEach(pojo -> Arrays.stream(pojo.getEntityClassIds()).forEach(entityClassId -> {
                    final Map<Integer, Long> typesMap =
                        statistics.computeIfAbsent(entityClassId, id -> new HashMap<>());
                    typesMap.merge(pojo.getTypeId(), -1L, Long::sum);
                }));
                return dataEntityStatisticsService.updateStatistics((long) Math.negateExact(pojos.size()), statistics);
            }))
            .then(lineageRepository.softDeleteLineageRelations(oddrns).then())
            .then(groupEntityRelationRepository.softDeleteRelationsForDeletedDataEntities(oddrns).then())
            .then(groupParentGroupRelationRepository.softDeleteRelationsForDeletedDataEntities(oddrns).then());
    }

    private Mono<Void> restore(final List<DataEntityPojo> deletedPojos) {
        final List<String> oddrns = deletedPojos.stream().map(DataEntityPojo::getOddrn).toList();
        return lineageRepository.restoreLineageRelations(oddrns)
            .then(groupEntityRelationRepository.restoreRelationsForDataEntities(oddrns).then())
            .then(groupParentGroupRelationRepository.restoreRelationsForDataEntities(oddrns).then())
            .then(Mono.defer(() -> {
                final Map<Integer, Map<Integer, Long>> statistics = new HashMap<>();
                deletedPojos.forEach(pojo -> Arrays.stream(pojo.getEntityClassIds()).forEach(entityClassId -> {
                    final Map<Integer, Long> typesMap =
                        statistics.computeIfAbsent(entityClassId, id -> new HashMap<>());
                    typesMap.merge(pojo.getTypeId(), 1L, Long::sum);
                }));
                return dataEntityStatisticsService.updateStatistics((long) deletedPojos.size(), statistics);
            }))
            .then();
    }

    private Mono<List<ActivityContextInfo>> getActivityContextInfos(final List<DataEntityPojo> pojos) {
        return Flux.fromIterable(pojos)
            .flatMap(pojo -> {
                final Map<String, Object> parameters = Map.of(DATA_ENTITY_POJO, pojo);
                return activityService.getContextInfo(parameters, ActivityEventTypeDto.DATA_ENTITY_STATUS_UPDATED);
            })
            .collectList();
    }

    private Mono<Void> logStatusChangeEvents(final List<ActivityContextInfo> oldStates,
                                             final List<Long> dataEntityIds) {
        return activityService.getUpdatedInfo(Map.of(), dataEntityIds, ActivityEventTypeDto.DATA_ENTITY_STATUS_UPDATED)
            .map(updatedInfo -> createStatusUpdatedActivityEvents(oldStates, updatedInfo))
            .flatMap(activityService::createActivityEvents);
    }

    private List<ActivityCreateEvent> createStatusUpdatedActivityEvents(final List<ActivityContextInfo> ctxInfos,
                                                                        final Map<Long, String> dtoMap) {
        return ctxInfos.stream()
            .map(ctx -> ActivityCreateEvent.builder()
                .dataEntityId(ctx.getDataEntityId())
                .oldState(ctx.getOldState())
                .eventType(ActivityEventTypeDto.DATA_ENTITY_STATUS_UPDATED)
                .newState(dtoMap.get(ctx.getDataEntityId()))
                .systemEvent(false)
                .build())
            .toList();
    }
}
