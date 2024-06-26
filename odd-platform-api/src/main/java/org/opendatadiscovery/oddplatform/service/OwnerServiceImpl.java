package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerList;
import org.opendatadiscovery.oddplatform.api.contract.model.Role;
import org.opendatadiscovery.oddplatform.exception.CascadeDeleteException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.OwnerMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerToRoleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveUserOwnerMappingRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class OwnerServiceImpl implements OwnerService {
    private final ReactiveOwnerRepository ownerRepository;
    private final ReactiveUserOwnerMappingRepository userOwnerMappingRepository;
    private final ReactiveSearchEntrypointRepository searchEntrypointRepository;
    private final ReactiveTermSearchEntrypointRepository termSearchEntrypointRepository;
    private final ReactiveTermOwnershipRepository termOwnershipRepository;
    private final ReactiveOwnershipRepository ownershipRepository;
    private final ReactiveOwnerToRoleRepository ownerToRoleRepository;
    private final OwnerMapper ownerMapper;

    @Override
    public Mono<OwnerPojo> getOrCreate(final String name) {
        return ownerRepository.getByName(name)
            .switchIfEmpty(ownerRepository.create(new OwnerPojo().setName(name)));
    }

    @Override
    public Mono<OwnerList> list(final int page,
                                final int size,
                                final String query,
                                final List<Long> ids,
                                final Boolean allowedForSync) {
        return ownerRepository.list(page, size, query, ids, allowedForSync)
            .map(ownerMapper::mapToOwnerList);
    }

    @Override
    @ReactiveTransactional
    public Mono<Owner> create(final OwnerFormData formData) {
        final List<Long> roleIds = getRoleIdsList(formData);
        return Mono.just(formData)
            .map(ownerMapper::mapToPojo)
            .flatMap(ownerRepository::create)
            .flatMap(owner -> ownerToRoleRepository
                .createRelations(owner.getId(), roleIds)
                .thenReturn(owner))
            .flatMap(owner -> ownerRepository.getDto(owner.getId()))
            .map(ownerMapper::mapFromDto);
    }

    @Override
    @ReactiveTransactional
    public Mono<Owner> update(final long id, final OwnerFormData updateEntityForm) {
        final List<Long> newRoles = getRoleIdsList(updateEntityForm);
        return ownerRepository.get(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Owner", id)))
            .map(pojo -> ownerMapper.applyToPojo(updateEntityForm, pojo))
            .flatMap(ownerRepository::update)
            .flatMap(owner -> ownerToRoleRepository
                .deleteOwnerRelationsExcept(owner.getId(), newRoles)
                .thenReturn(owner))
            .flatMap(owner -> ownerToRoleRepository
                .createRelations(owner.getId(), newRoles)
                .thenReturn(owner))
            .flatMap(this::updateSearchVectors)
            .flatMap(owner -> ownerRepository.getDto(owner.getId()))
            .map(ownerMapper::mapFromDto);
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> delete(final long id) {
        return Mono.zip(termOwnershipRepository.existsByOwner(id), ownershipRepository.existsByOwner(id),
                userOwnerMappingRepository.isOwnerAssociated(id))
            .map(t -> BooleanUtils.toBoolean(t.getT1()) || BooleanUtils.toBoolean(t.getT2())
                || BooleanUtils.toBoolean(t.getT3()))
            .filter(exists -> !exists)
            .switchIfEmpty(Mono.error(new CascadeDeleteException(
                "Owner cannot be deleted: there are still resources attached")))
            .then(ownerToRoleRepository.deleteOwnerRelationsExcept(id, List.of()))
            .then(ownerRepository.delete(id))
            .then();
    }

    @Override
    public Mono<Owner> getOwnerDtoById(final long ownerId) {
        return ownerRepository.getDto(ownerId)
            .switchIfEmpty(Mono.error(new NotFoundException("Owner", ownerId)))
            .map(ownerMapper::mapFromDto);
    }

    private Mono<OwnerPojo> updateSearchVectors(final OwnerPojo owner) {
        return Mono.zip(
            searchEntrypointRepository.updateChangedOwnerVectors(owner.getId()),
            termSearchEntrypointRepository.updateChangedOwnerVectors(owner.getId())
        ).thenReturn(owner);
    }

    private List<Long> getRoleIdsList(final OwnerFormData formData) {
        if (CollectionUtils.isEmpty(formData.getRoles())) {
            return List.of();
        } else {
            return formData.getRoles().stream().map(Role::getId).toList();
        }
    }
}
