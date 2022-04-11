package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.BlockingTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.Ownership;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.Role;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleFormData;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.OwnershipMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.repository.OwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.RoleRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class OwnershipServiceImpl implements OwnershipService {
    private final RoleService roleService;
    private final OwnerService ownerService;
    private final OwnershipRepository ownershipRepository;
    private final RoleRepository roleRepository;

    private final OwnershipMapper ownershipMapper;

    @Override
    @BlockingTransactional
    public Mono<Ownership> create(final long dataEntityId,
                                  final OwnershipFormData formData) {
        final Owner owner = ownerService.createOrGet(new OwnerFormData().name(formData.getOwnerName()));
        final Role role = roleService.createOrGet(new RoleFormData().name(formData.getRoleName()));
        final OwnershipPojo ownershipPojo = ownershipRepository.create(new OwnershipPojo()
            .setDataEntityId(dataEntityId)
            .setOwnerId(owner.getId())
            .setRoleId(role.getId()));
        ownershipRepository.updateSearchVectors(ownershipPojo.getId());
        final Ownership ownership = ownershipMapper.mapModel(ownershipPojo, owner, role);
        return Mono.just(ownership);
    }

    @Override
    public Mono<Void> delete(final long ownershipId) {
        return Mono
            .fromRunnable(() -> ownershipRepository.delete(ownershipId))
            .then();
    }

    @Override
    @BlockingTransactional
    public Mono<Ownership> update(final long ownershipId,
                                  final OwnershipUpdateFormData formData) {
        if (ownershipRepository.get(ownershipId) == null) {
            return Mono.error(new NotFoundException("Ownership with id = [%s] was not found", ownershipId));
        }

        final long roleId = roleRepository
            .createOrGet(new RolePojo().setName(formData.getRoleName()))
            .getId();

        ownershipRepository.updateRole(ownershipId, roleId);
        final OwnershipDto ownershipDto = ownershipRepository.get(ownershipId);
        ownershipRepository.updateSearchVectors(ownershipId);
        final Ownership ownership = ownershipMapper.mapDto(ownershipDto);

        return Mono.just(ownership);
    }
}
