package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.Ownership;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.OwnershipMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.service.activity.ActivityLog;
import org.opendatadiscovery.oddplatform.service.activity.ActivityParameter;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.OWNERS;
import static org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto.OWNERSHIP_CREATED;
import static org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto.OWNERSHIP_DELETED;
import static org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto.OWNERSHIP_UPDATED;
import static org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.OwnershipCreate.DATA_ENTITY_ID;
import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class OwnershipServiceImpl implements OwnershipService {
    private final TitleService titleService;
    private final OwnerService ownerService;
    private final ReactiveOwnershipRepository ownershipRepository;
    private final ReactiveSearchEntrypointRepository searchEntrypointRepository;
    private final DataEntityFilledService dataEntityFilledService;
    private final OwnershipMapper ownershipMapper;

    @Override
    @ActivityLog(event = OWNERSHIP_CREATED)
    @ReactiveTransactional
    public Mono<Ownership> create(@ActivityParameter(DATA_ENTITY_ID) final long dataEntityId,
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
    public Mono<Void> delete(
        @ActivityParameter(ActivityParameterNames.OwnershipDelete.OWNERSHIP_ID) final long ownershipId) {
        return ownershipRepository.delete(ownershipId)
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
    public Mono<Ownership> update(
        @ActivityParameter(ActivityParameterNames.OwnershipUpdate.OWNERSHIP_ID) final long ownershipId,
        final OwnershipUpdateFormData formData) {
        return ownershipRepository.get(ownershipId)
            .switchIfEmpty(Mono.error(new NotFoundException("Ownership with id = [%s] was not found", ownershipId)))
            .then(titleService.getOrCreate(formData.getTitleName()))
            .flatMap(titlePojo -> ownershipRepository.updateTitle(ownershipId, titlePojo.getId()))
            .then(ownershipRepository.get(ownershipId))
            .flatMap(dto -> searchEntrypointRepository.updateChangedOwnershipVectors(ownershipId)
                .thenReturn(dto))
            .map(ownershipMapper::mapDto);
    }
}
