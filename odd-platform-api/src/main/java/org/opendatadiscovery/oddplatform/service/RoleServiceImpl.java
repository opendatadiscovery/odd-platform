package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.Policy;
import org.opendatadiscovery.oddplatform.api.contract.model.Role;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleList;
import org.opendatadiscovery.oddplatform.mapper.RoleMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerToRoleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRoleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRoleToPolicyRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {
    private static final Set<String> PREDEFINED_ROLES = Set.of("admin", "user");

    private final RoleMapper roleMapper;
    private final ReactiveRoleRepository roleRepository;
    private final ReactiveRoleToPolicyRepository roleToPolicyRepository;
    private final ReactiveOwnerToRoleRepository ownerToRoleRepository;

    @Override
    public Mono<RoleList> list(final int page, final int size, final String query) {
        return roleRepository.listDto(page, size, query)
            .map(roleMapper::mapToRoleList);
    }

    @Override
    @ReactiveTransactional
    public Mono<Role> create(final RoleFormData formData) {
        final List<Long> policies = getPolicyIdsList(formData);
        return Mono.just(formData)
            .map(roleMapper::mapToPojo)
            .flatMap(roleRepository::create)
            .flatMap(role -> roleToPolicyRepository
                .createRelations(role.getId(), policies)
                .thenReturn(role))
            .flatMap(role -> roleRepository.getDto(role.getId()))
            .map(roleMapper::mapFromDto);
    }

    @Override
    @ReactiveTransactional
    public Mono<Role> update(final long id, final RoleFormData formData) {
        final List<Long> newPolicies = getPolicyIdsList(formData);
        return roleRepository.get(id)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Role with id %s not found".formatted(id))))
            .map(role -> roleMapper.applyToPojo(formData, role))
            .flatMap(roleRepository::update)
            .flatMap(role -> roleToPolicyRepository
                .deleteRoleRelationsExcept(role.getId(), newPolicies)
                .thenReturn(role))
            .flatMap(role -> roleToPolicyRepository
                .createRelations(role.getId(), newPolicies)
                .thenReturn(role))
            .flatMap(role -> roleRepository.getDto(role.getId()))
            .map(roleMapper::mapFromDto);
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> delete(final long id) {
        return roleRepository.get(id)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Role with id %s not found".formatted(id))))
            .filter(role -> !PREDEFINED_ROLES.contains(role.getName()))
            .switchIfEmpty(Mono.error(
                new IllegalArgumentException("Role with id %s is predefined and cannot be deleted".formatted(id))))
            .then(ownerToRoleRepository.isRoleAttachedToOwner(id))
            .filter(Boolean::booleanValue)
            .flatMap(isAttached -> Mono.error(
                new IllegalStateException("Role with id %d is attached to a owner".formatted(id))))
            .then(roleToPolicyRepository.deleteRoleRelationsExcept(id, List.of()))
            .then(roleRepository.delete(id))
            .then();
    }

    private List<Long> getPolicyIdsList(final RoleFormData formData) {
        if (CollectionUtils.isEmpty(formData.getPolicies())) {
            return List.of();
        } else {
            return formData.getPolicies().stream().map(Policy::getId).toList();
        }
    }
}
