package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.Owner;
import com.provectus.oddplatform.api.contract.model.OwnerFormData;
import com.provectus.oddplatform.api.contract.model.Ownership;
import com.provectus.oddplatform.api.contract.model.OwnershipFormData;
import com.provectus.oddplatform.api.contract.model.OwnershipUpdateFormData;
import com.provectus.oddplatform.api.contract.model.Role;
import com.provectus.oddplatform.api.contract.model.RoleFormData;
import com.provectus.oddplatform.mapper.OwnershipMapper;
import com.provectus.oddplatform.model.tables.pojos.OwnershipPojo;
import com.provectus.oddplatform.repository.OwnershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class OwnershipServiceImpl implements OwnershipService {
    private final RoleService roleService;
    private final OwnerService ownerService;
    private final OwnershipRepository ownershipRepository;

    private final OwnershipMapper ownershipMapper;

    @Override
    public Mono<Ownership> create(final long dataEntityId,
                                  final OwnershipFormData formData) {
        final Mono<Owner> owner = ownerService.createOrGet(new OwnerFormData().name(formData.getOwnerName()));
        final Mono<Role> role = roleService.createOrGet(new RoleFormData().name(formData.getRoleName()));

        return Mono.zip(owner, role).map(t -> {
            final OwnershipPojo pojo = ownershipRepository.create(new OwnershipPojo()
                .setDataEntityId(dataEntityId)
                .setOwnerId(t.getT1().getId())
                .setRoleId(t.getT2().getId()));
            
            return ownershipMapper.mapModel(pojo, t.getT1(), t.getT2());
        });
    }

    @Override
    public Mono<Void> delete(final long ownershipId) {
        return Mono
            .fromRunnable(() -> ownershipRepository.delete(ownershipId))
            .then();
    }

    @Override
    public Mono<Ownership> update(final long ownershipId,
                                  final OwnershipUpdateFormData formData) {
        return Mono
            .fromCallable(() -> ownershipRepository.updateRole(ownershipId, formData.getRoleName()))
            .map(ownershipMapper::mapDto);
    }
}
