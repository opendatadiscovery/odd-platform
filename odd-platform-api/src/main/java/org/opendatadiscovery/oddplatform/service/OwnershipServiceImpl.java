package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.ArrayUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.Ownership;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.OwnershipMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGroupEntityRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityLog;
import org.opendatadiscovery.oddplatform.service.activity.ActivityParameter;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.OwnershipCreate;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.OwnershipDelete;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.OwnershipUpdate;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_ENTITY_GROUP;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.OWNERS;
import static org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto.OWNERSHIP_CREATED;
import static org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto.OWNERSHIP_DELETED;
import static org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto.OWNERSHIP_UPDATED;
import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class OwnershipServiceImpl implements OwnershipService {
    private final ReactiveDataEntityRepository dataEntityRepository;
    private final ReactiveGroupEntityRelationRepository groupEntityRelationRepository;
    private final TitleService titleService;
    private final OwnerService ownerService;
    private final ReactiveOwnershipRepository ownershipRepository;
    private final ReactiveSearchEntrypointRepository searchEntrypointRepository;
    private final DataEntityFilledService dataEntityFilledService;
    private final OwnershipMapper ownershipMapper;

    @Override
    @ActivityLog(event = OWNERSHIP_CREATED)
    @ReactiveTransactional
    public Mono<Ownership> create(@ActivityParameter(OwnershipCreate.DATA_ENTITY_ID) final long dataEntityId,
                                  final OwnershipFormData formData) {
        return Mono.zip(ownerService.getOrCreate(formData.getOwnerName()),
                titleService.getOrCreate(formData.getTitleName()))
            .map(function((owner, title) -> Tuples.of(owner, title, new OwnershipPojo()
                .setDataEntityId(dataEntityId)
                .setOwnerId(owner.getId())
                .setTitleId(title.getId())
            )))
            .flatMap(function((owner, title, ownership) -> ownershipRepository.create(ownership)
                .map(pojo -> Tuples.of(owner, title, pojo))))
            .flatMap(function((owner, title, ownership) -> {
                if (Boolean.TRUE.equals(formData.getPropagate())) {
                    return propagateIfDEG(ownership, OwnershipPropagateAction.CREATE)
                        .then(Mono.just(Tuples.of(owner, title, ownership)));
                }
                return Mono.just(Tuples.of(owner, title, ownership));
            }))
            .flatMap(function((owner, title, ownership) -> searchEntrypointRepository
                .updateChangedOwnershipVectors(ownership.getId())
                .thenReturn(new OwnershipDto(ownership, owner, title))))
            .flatMap(
                ownershipDto -> dataEntityFilledService.markEntityFilled(dataEntityId, OWNERS).thenReturn(ownershipDto))
            .map(ownershipMapper::mapDto);
    }

    @Override
    @ActivityLog(event = OWNERSHIP_DELETED)
    @ReactiveTransactional
    public Mono<Void> delete(@ActivityParameter(OwnershipDelete.OWNERSHIP_ID) final long ownershipId,
                             final Boolean propagate) {
        return ownershipRepository.delete(ownershipId)
            .flatMap(pojo -> {
                if (Boolean.TRUE.equals(propagate)) {
                    return propagateIfDEG(pojo, OwnershipPropagateAction.DELETE).then(Mono.just(pojo));
                }
                return Mono.just(pojo);
            })
            .flatMap(pojo -> ownershipRepository.getOwnershipsByDataEntityId(pojo.getDataEntityId())
                .collectList()
                .flatMap(ownershipDtos -> {
                    if (CollectionUtils.isEmpty(ownershipDtos)) {
                        return dataEntityFilledService.markEntityUnfilled(pojo.getDataEntityId(), OWNERS);
                    }
                    return Mono.just(ownershipDtos);
                })
            ).then();
    }

    @Override
    @ActivityLog(event = OWNERSHIP_UPDATED)
    @ReactiveTransactional
    public Mono<Ownership> update(@ActivityParameter(OwnershipUpdate.OWNERSHIP_ID) final long ownershipId,
                                  final OwnershipUpdateFormData formData) {
        return ownershipRepository.get(ownershipId)
            .switchIfEmpty(Mono.error(new NotFoundException("Ownership", ownershipId)))
            .then(titleService.getOrCreate(formData.getTitleName()))
            .flatMap(titlePojo -> ownershipRepository.updateTitle(ownershipId, titlePojo.getId()))
            .flatMap(ownershipPojo -> {
                if (Boolean.TRUE.equals(formData.getPropagate())) {
                    return propagateIfDEG(ownershipPojo, OwnershipPropagateAction.CREATE)
                        .then(Mono.just(ownershipPojo));
                }
                return Mono.just(ownershipPojo);
            })
            .then(ownershipRepository.get(ownershipId))
            .flatMap(dto -> searchEntrypointRepository.updateChangedOwnershipVectors(ownershipId)
                .thenReturn(dto))
            .map(ownershipMapper::mapDto);
    }

    private Mono<List<OwnershipPojo>> propagateIfDEG(final OwnershipPojo ownership,
                                                     final OwnershipPropagateAction action) {
        final Long dataEntityId = ownership.getDataEntityId();
        return dataEntityRepository.get(dataEntityId)
            .switchIfEmpty(Mono.error(new NotFoundException("Data Entity", dataEntityId)))
            .flatMap(pojo -> {
                if (!ArrayUtils.contains(pojo.getEntityClassIds(), DATA_ENTITY_GROUP.getId())) {
                    return Mono.just(List.of());
                }
                return propagateOwnership(ownership, action);
            });
    }

    private Mono<List<OwnershipPojo>> propagateOwnership(final OwnershipPojo ownership,
                                                         final OwnershipPropagateAction action) {
        return groupEntityRelationRepository.getDEGEntitiesOddrns(ownership.getDataEntityId())
            .collectList()
            .flatMapMany(childrenOddrns -> dataEntityRepository.listAllByOddrns(childrenOddrns, false))
            .map(child -> new OwnershipPojo()
                .setDataEntityId(child.getId())
                .setOwnerId(ownership.getOwnerId())
                .setTitleId(ownership.getTitleId()))
            .collectList()
            .flatMapMany(pojos -> switch (action) {
                case CREATE -> ownershipRepository.createOrUpdate(pojos);
                case DELETE -> ownershipRepository.deleteByDataEntityAndOwner(pojos);
            })
            .collectList();
    }

    enum OwnershipPropagateAction {
        CREATE, DELETE
    }
}
