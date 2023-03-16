package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityCreateEvent;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.CascadeDeleteException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.CompactDataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.CompactDataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGroupEntityRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityLog;
import org.opendatadiscovery.oddplatform.service.activity.ActivityParameter;
import org.opendatadiscovery.oddplatform.service.activity.ActivityService;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames;
import org.opendatadiscovery.oddrn.Generator;
import org.opendatadiscovery.oddrn.model.ODDPlatformDataEntityGroupPath;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_ENTITY_GROUP;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.MANUALLY_CREATED;
import static reactor.function.TupleUtils.function;

@Service
@Slf4j
@RequiredArgsConstructor
public class DataEntityGroupServiceImpl implements DataEntityGroupService {
    private final Generator oddrnGenerator = new Generator();

    private final NamespaceService namespaceService;
    private final ActivityService activityService;
    private final DataEntityFilledService dataEntityFilledService;
    private final TagService tagService;
    private final DataEntityStatisticsService dataEntityStatisticsService;

    private final ReactiveDataEntityRepository reactiveDataEntityRepository;
    private final ReactiveGroupEntityRelationRepository reactiveGroupEntityRelationRepository;
    private final ReactiveTermRepository reactiveTermRepository;
    private final ReactiveOwnershipRepository ownershipRepository;
    private final ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;

    private final DataEntityMapper dataEntityMapper;

    @Override
    @ReactiveTransactional
    public Mono<DataEntityRef> createDataEntityGroup(final DataEntityGroupFormData formData) {
        if (StringUtils.isNotEmpty(formData.getNamespaceName())) {
            return namespaceService.getOrCreate(formData.getNamespaceName())
                .flatMap(namespacePojo -> createDEG(formData, namespacePojo));
        } else {
            return createDEG(formData, null);
        }
    }

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.CUSTOM_GROUP_UPDATED)
    public Mono<DataEntityRef> updateDataEntityGroup(
        @ActivityParameter(ActivityParameterNames.CustomGroupUpdated.DATA_ENTITY_ID) final Long id,
        final DataEntityGroupFormData formData) {
        return reactiveDataEntityRepository.get(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Data entity group", id)))
            .filter(DataEntityPojo::getManuallyCreated)
            .switchIfEmpty(Mono.error(new BadUserRequestException("Can't update ingested data entity")))
            .flatMap(pojo -> {
                if (StringUtils.isNotEmpty(formData.getNamespaceName())) {
                    return namespaceService.getOrCreate(formData.getNamespaceName())
                        .flatMap(namespacePojo -> updateDEG(pojo, formData, namespacePojo));
                } else {
                    return updateDEG(pojo, formData, null);
                }
            });
    }

    @Override
    @ActivityLog(event = ActivityEventTypeDto.CUSTOM_GROUP_DELETED)
    @ReactiveTransactional
    public Mono<DataEntityPojo> deleteDataEntityGroup(
        @ActivityParameter(ActivityParameterNames.CustomGroupDeleted.DATA_ENTITY_ID) final Long id) {
        return reactiveGroupEntityRelationRepository.degHasEntities(id)
            .filter(hasEntities -> !hasEntities)
            .switchIfEmpty(Mono.error(new CascadeDeleteException("Can't delete data entity group with entities")))
            .then(reactiveDataEntityRepository.get(id))
            .switchIfEmpty(Mono.error(new NotFoundException("Data entity group", id)))
            .filter(DataEntityPojo::getManuallyCreated)
            .switchIfEmpty(Mono.error(new BadUserRequestException("Can't delete ingested data entity")))
            .flatMap(this::deleteDEG);
    }

    @Override
    public Mono<CompactDataEntityList> listEntitiesWithinDEG(final String degOddrn) {
        return reactiveDataEntityRepository.getDEGEntities(degOddrn)
            .map(entityList -> entityList.stream()
                .map(de -> {
                    final DataEntityTypeDto type = DataEntityTypeDto
                        .findById(de.getTypeId())
                        .orElseThrow(() -> new IllegalStateException(
                            "Incorrect type id %d in the database".formatted(de.getTypeId())));

                    return new CompactDataEntity()
                        .oddrn(de.getOddrn())
                        .type(DataEntityType.fromValue(type.toString()));
                })
                .toList())
            .map(entityList -> new CompactDataEntityList().items(entityList));
    }

    private Mono<DataEntityRef> createDEG(final DataEntityGroupFormData formData,
                                          final NamespacePojo namespace) {
        return Mono.just(formData)
            .map(fd -> dataEntityMapper.mapToPojo(fd, DATA_ENTITY_GROUP, namespace))
            .flatMap(reactiveDataEntityRepository::create)
            .map(pojo -> {
                final String oddrn = generateOddrn(pojo);
                pojo.setOddrn(oddrn);
                return pojo;
            })
            .flatMap(reactiveDataEntityRepository::update)
            .flatMap(pojo -> {
                final List<String> entityOddrns =
                    formData.getEntities().stream().map(DataEntityRef::getOddrn).toList();
                return reactiveGroupEntityRelationRepository.createRelationsReturning(pojo.getOddrn(), entityOddrns)
                    .ignoreElements().thenReturn(pojo);
            })
            .flatMap(pojo -> dataEntityStatisticsService.updateStatistics(1L,
                Map.of(DATA_ENTITY_GROUP.getId(), Map.of(pojo.getTypeId(), 1L))).thenReturn(pojo))
            .flatMap(this::updateSearchVectors)
            .map(dataEntityMapper::mapRef)
            .flatMap(ref -> logDEGCreatedActivityEvent(ref).thenReturn(ref))
            .flatMap(ref -> dataEntityFilledService.markEntityFilled(ref.getId(), MANUALLY_CREATED).thenReturn(ref));
    }

    private Mono<DataEntityRef> updateDEG(final DataEntityPojo pojo,
                                          final DataEntityGroupFormData formData,
                                          final NamespacePojo namespace) {
        final Integer previousTypeId = pojo.getTypeId();
        final List<String> entityOddrns =
            formData.getEntities().stream().map(DataEntityRef::getOddrn).toList();
        return Mono.just(formData)
            .map(fd -> dataEntityMapper.applyToPojo(fd, namespace, pojo))
            .flatMap(reactiveDataEntityRepository::updateDEG)
            .flatMap(degPojo -> reactiveGroupEntityRelationRepository
                .deleteRelationsExcept(degPojo.getOddrn(), entityOddrns).ignoreElements().thenReturn(degPojo))
            .flatMap(degPojo -> reactiveGroupEntityRelationRepository
                .createRelationsReturning(degPojo.getOddrn(), entityOddrns)
                .ignoreElements().thenReturn(degPojo))
            .flatMap(this::updateSearchVectors)
            .flatMap(degPojo -> {
                if (previousTypeId.equals(degPojo.getTypeId())) {
                    return Mono.just(degPojo);
                }
                return dataEntityStatisticsService.updateStatistics(0L,
                        Map.of(DATA_ENTITY_GROUP.getId(), Map.of(previousTypeId, -1L, degPojo.getTypeId(), 1L)))
                    .thenReturn(degPojo);
            })
            .map(dataEntityMapper::mapRef);
    }

    private Mono<DataEntityPojo> deleteDEG(final DataEntityPojo pojo) {
        return Flux.zip(
            dataEntityStatisticsService.updateStatistics(-1L,
                Map.of(DATA_ENTITY_GROUP.getId(), Map.of(pojo.getTypeId(), -1L))),
            reactiveTermRepository.deleteRelationsWithTerms(pojo.getId()),
            reactiveGroupEntityRelationRepository.deleteRelationsForDEG(pojo.getOddrn()),
            tagService.deleteRelationsForDataEntity(pojo.getId()),
            ownershipRepository.deleteByDataEntityId(pojo.getId()),
            dataEntityFilledService.markEntityUnfilled(pojo.getId(), MANUALLY_CREATED)
        ).then(reactiveDataEntityRepository.delete(pojo.getId()));
    }

    private String generateOddrn(final DataEntityPojo pojo) {
        try {
            return oddrnGenerator.generate(ODDPlatformDataEntityGroupPath.builder()
                .id(pojo.getId())
                .build(), "id");
        } catch (final Exception e) {
            log.error("Error while generating oddrn for data entity {}", pojo.getId(), e);
            throw new RuntimeException(e);
        }
    }

    private Mono<DataEntityPojo> updateSearchVectors(final DataEntityPojo pojo) {
        return Mono.zip(
            reactiveSearchEntrypointRepository.updateDataEntityVectors(pojo.getId()),
            reactiveSearchEntrypointRepository.updateNamespaceVectorForDataEntity(pojo.getId())
        ).thenReturn(pojo);
    }

    private Mono<Void> logDEGCreatedActivityEvent(final DataEntityRef ref) {
        return Mono.zip(activityService.getContextInfo(Map.of(), ActivityEventTypeDto.CUSTOM_GROUP_CREATED),
                activityService.getUpdatedInfo(Map.of(), ref.getId(), ActivityEventTypeDto.CUSTOM_GROUP_CREATED))
            .map(function((ci, newState) -> ActivityCreateEvent.builder()
                .dataEntityId(ref.getId())
                .oldState(ci.getOldState())
                .newState(newState)
                .eventType(ActivityEventTypeDto.CUSTOM_GROUP_CREATED)
                .systemEvent(false)
                .build()
            )).flatMap(activityService::createActivityEvent);
    }
}
