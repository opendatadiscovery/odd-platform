package org.opendatadiscovery.oddplatform.service;

import java.io.InputStream;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.Policy;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyList;
import org.opendatadiscovery.oddplatform.dto.RoleDto;
import org.opendatadiscovery.oddplatform.dto.security.UserProviderRole;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.PolicyMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.PolicyPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactivePolicyRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRoleToPolicyRepository;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class PolicyServiceImpl implements PolicyService {
    private static final String POLICY_SCHEMA = loadPolicySchema();
    private static final String ADMINISTRATOR_POLICY = "Administrator";

    private final ReactivePolicyRepository policyRepository;
    private final ReactiveRoleToPolicyRepository roleToPolicyRepository;
    private final PolicyJSONValidator policyJSONValidator;
    private final PolicyMapper policyMapper;
    private final RoleService roleService;

    private static String loadPolicySchema() {
        try (final InputStream is = new ClassPathResource("schema/policy_schema.json").getInputStream()) {
            return new String(is.readAllBytes());
        } catch (final Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public Mono<PolicyDetails> getPolicyDetails(final long id) {
        return policyRepository.get(id)
            .map(policyMapper::mapToDetails);
    }

    @Override
    public Mono<PolicyList> list(final int page, final int size, final String query) {
        return roleService.getCurrentUserRoles()
            .filter(roles -> roles.stream()
                .noneMatch(r -> r.pojo().getName().equals(UserProviderRole.ADMIN.getValue())))
            .map(roles -> getRolePolicies(roles, query))
            .switchIfEmpty(Mono.defer(() -> policyRepository.list(page, size, query)))
            .map(policyMapper::mapToPolicyList);
    }

    @Override
    public Mono<PolicyDetails> create(final PolicyFormData formData) {
        policyJSONValidator.validate(formData.getPolicy());
        return Mono.just(formData)
            .map(policyMapper::mapToPojo)
            .flatMap(policyRepository::create)
            .map(policyMapper::mapToDetails);
    }

    @Override
    public Mono<PolicyDetails> update(final long id, final PolicyFormData formData) {
        policyJSONValidator.validate(formData.getPolicy());
        return policyRepository.get(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Policy with id %d hasn't been found".formatted(id))))
            .filter(policy -> !policy.getName().equals(ADMINISTRATOR_POLICY))
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Administrator policy cannot be updated")))
            .map(pojo -> policyMapper.applyToPojo(formData, pojo))
            .flatMap(policyRepository::update)
            .map(policyMapper::mapToDetails);
    }

    @Override
    public Mono<Policy> delete(final long id) {
        return policyRepository.get(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Policy with id %d hasn't been found".formatted(id))))
            .filter(policy -> !policy.getName().equals(ADMINISTRATOR_POLICY))
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Administrator policy cannot be deleted")))
            .then(roleToPolicyRepository.isPolicyAttachedToRole(id))
            .filter(Boolean::booleanValue)
            .flatMap(isAttached -> Mono.error(
                new IllegalStateException("Policy with id %d is attached to a role".formatted(id))))
            .then(policyRepository.delete(id))
            .map(policyMapper::mapToPolicy);
    }

    @Override
    public Mono<String> getPolicySchema() {
        return Mono.just(POLICY_SCHEMA);
    }

    @Override
    public Mono<List<PolicyPojo>> getCurrentUserPolicies() {
        return roleService.getCurrentUserRoles()
            .map(roles -> roles.stream().map(r -> r.pojo().getId()).toList())
            .flatMap(policyRepository::getRolesPolicies);
    }

    private Page<PolicyPojo> getRolePolicies(final List<RoleDto> roles, final String query) {
        final List<PolicyPojo> filteredPolicies = roles.stream()
            .flatMap(r -> r.policies().stream())
            .filter(policy -> StringUtils.isEmpty(query)
                || policy.getName().toLowerCase().contains(query.toLowerCase()))
            .toList();
        return new Page<>(filteredPolicies, filteredPolicies.size(), false);
    }
}
