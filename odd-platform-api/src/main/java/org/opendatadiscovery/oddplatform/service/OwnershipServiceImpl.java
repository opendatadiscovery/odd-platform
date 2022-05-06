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
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class OwnershipServiceImpl implements OwnershipService {
    private final RoleService roleService;
    private final OwnerService ownerService;
    private final ReactiveOwnershipRepository ownershipRepository;
    private final ReactiveSearchEntrypointRepository searchEntrypointRepository;
    private final OwnershipMapper ownershipMapper;

    @Override
    @ReactiveTransactional
    public Mono<Ownership> create(final long dataEntityId,
                                  final OwnershipFormData formData) {
        return Mono.zip(ownerService.getOrCreate(formData.getOwnerName()),
                roleService.getOrCreate(formData.getRoleName()))
            .map(function((owner, role) -> Tuples.of(owner, role, new OwnershipPojo()
                .setDataEntityId(dataEntityId)
                .setOwnerId(owner.getId())
                .setRoleId(role.getId())
            )))
            .flatMap(function((owner, role, ownership) -> ownershipRepository.create(ownership)
                .map(pojo -> Tuples.of(owner, role, pojo))))
            .flatMap(function((owner, role, ownership) -> searchEntrypointRepository
                .updateChangedOwnershipVectors(ownership.getId())
                .thenReturn(new OwnershipDto(ownership, owner, role))))
            .map(ownershipMapper::mapDto);
    }

    @Override
    public Mono<Void> delete(final long ownershipId) {
        return ownershipRepository.delete(ownershipId)
            .then();
    }

    @Override
    @ReactiveTransactional
    public Mono<Ownership> update(final long ownershipId,
                                  final OwnershipUpdateFormData formData) {
        return ownershipRepository.get(ownershipId)
            .switchIfEmpty(Mono.error(new NotFoundException("Ownership with id = [%s] was not found", ownershipId)))
            .then(roleService.getOrCreate(formData.getRoleName()))
            .flatMap(rolePojo -> ownershipRepository.updateRole(ownershipId, rolePojo.getId()))
            .then(ownershipRepository.get(ownershipId))
            .flatMap(dto -> searchEntrypointRepository.updateChangedOwnershipVectors(ownershipId)
                .thenReturn(dto))
            .map(ownershipMapper::mapDto);
    }
}
