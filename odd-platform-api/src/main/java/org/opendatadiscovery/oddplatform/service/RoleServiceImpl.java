package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.Policy;
import org.opendatadiscovery.oddplatform.api.contract.model.Role;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleList;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.RoleDto;
import org.opendatadiscovery.oddplatform.dto.security.UserProviderRole;
import org.opendatadiscovery.oddplatform.mapper.RoleMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerToRoleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRoleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRoleToPolicyRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveUserOwnerMappingRepository;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {
    private final RoleMapper roleMapper;
    private final ReactiveRoleRepository roleRepository;
    private final ReactiveRoleToPolicyRepository roleToPolicyRepository;
    private final ReactiveOwnerToRoleRepository ownerToRoleRepository;
    private final AuthIdentityProvider authIdentityProvider;
    private final ReactiveUserOwnerMappingRepository userOwnerMappingRepository;

    @Override
    public Mono<RoleList> list(final int page, final int size, final String query) {
        return getCurrentUserRoles()
            .filter(roles -> roles.stream()
                .noneMatch(r -> r.pojo().getName().equals(UserProviderRole.ADMIN.getValue())))
            .map(roles -> filterUserRoles(roles, query))
            .switchIfEmpty(Mono.defer(() -> roleRepository.listDto(page, size, query)))
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
        return roleRepository.get(id)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Role with id %s not found".formatted(id))))
            .filter(role -> !role.getName().equals(UserProviderRole.ADMIN.getValue()))
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Administrator role is not editable")))
            .flatMap(role -> updateRoleName(role, formData))
            .flatMap(role -> updateRolePolicyRelations(role, formData))
            .flatMap(role -> roleRepository.getDto(role.getId()))
            .map(roleMapper::mapFromDto);
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> delete(final long id) {
        return roleRepository.get(id)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Role with id %s not found".formatted(id))))
            .filter(role -> Stream.of(UserProviderRole.values())
                .noneMatch(r -> r.getValue().equalsIgnoreCase(role.getName())))
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

    @Override
    public Mono<List<RoleDto>> getCurrentUserRoles() {
        return authIdentityProvider.getCurrentUser()
            .flatMap(user -> userOwnerMappingRepository.getUserRolesByOwner(user.username(), user.provider()))
            .filter(CollectionUtils::isNotEmpty)
            .switchIfEmpty(Mono.defer(() -> getUserProviderRole().map(List::of)))
            .switchIfEmpty(Mono.just(List.of()));
    }

    private Mono<RolePojo> updateRoleName(final RolePojo role, final RoleFormData formData) {
        if (role.getName().equals(UserProviderRole.USER.getValue())
            && !StringUtils.equals(role.getName(), formData.getName())) {
            return Mono.error(new IllegalArgumentException("User role name cannot be changed"));
        }
        return Mono.just(roleMapper.applyToPojo(formData, role))
            .flatMap(roleRepository::update);
    }

    private Mono<RolePojo> updateRolePolicyRelations(final RolePojo rolePojo, final RoleFormData formData) {
        final List<Long> newPolicies = getPolicyIdsList(formData);
        return Mono.just(rolePojo)
            .flatMap(role -> roleToPolicyRepository
                .deleteRoleRelationsExcept(role.getId(), newPolicies)
                .thenReturn(role))
            .flatMap(role -> roleToPolicyRepository
                .createRelations(role.getId(), newPolicies)
                .thenReturn(role));
    }

    private Mono<RoleDto> getUserProviderRole() {
        return authIdentityProvider.getCurrentUserProviderRole()
            .flatMap(role -> roleRepository.getByName(role.getValue()));
    }

    private List<Long> getPolicyIdsList(final RoleFormData formData) {
        if (CollectionUtils.isEmpty(formData.getPolicies())) {
            return List.of();
        } else {
            return formData.getPolicies().stream().map(Policy::getId).toList();
        }
    }

    private Page<RoleDto> filterUserRoles(final List<RoleDto> userRoles, final String query) {
        final List<RoleDto> filteredRoles = userRoles.stream()
            .filter(role -> StringUtils.isEmpty(query)
                || role.pojo().getName().toLowerCase().contains(query.toLowerCase()))
            .toList();
        return new Page<>(filteredRoles, filteredRoles.size(), false);
    }
}