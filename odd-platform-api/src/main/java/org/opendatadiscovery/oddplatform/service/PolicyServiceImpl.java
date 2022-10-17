package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.Policy;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyList;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.PolicyMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactivePolicyRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRoleToPolicyRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class PolicyServiceImpl implements PolicyService {
    private final ReactivePolicyRepository policyRepository;
    private final ReactiveRoleToPolicyRepository roleToPolicyRepository;
    private final PolicyValidator policyValidator;
    private final PolicyMapper policyMapper;

    @Override
    public Mono<PolicyDetails> getPolicyDetails(final long id) {
        return policyRepository.get(id)
            .map(policyMapper::mapToDetails);
    }

    @Override
    public Mono<PolicyList> list(final int page, final int size, final String query) {
        return policyRepository.list(page, size, query)
            .map(policyMapper::mapToPolicyList);
    }

    @Override
    public Mono<PolicyDetails> create(final PolicyFormData formData) {
        policyValidator.validate(formData.getPolicy());
        return Mono.just(formData)
            .map(policyMapper::mapToPojo)
            .flatMap(policyRepository::create)
            .map(policyMapper::mapToDetails);
    }

    @Override
    public Mono<PolicyDetails> update(final long id, final PolicyFormData formData) {
        policyValidator.validate(formData.getPolicy());
        return policyRepository.get(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Policy with id %d hasn't been found".formatted(id))))
            .map(pojo -> policyMapper.applyToPojo(formData, pojo))
            .flatMap(policyRepository::update)
            .map(policyMapper::mapToDetails);
    }

    @Override
    public Mono<Policy> delete(final long id) {
        return roleToPolicyRepository.isPolicyAttachedToRole(id)
            .filter(Boolean::booleanValue)
            .flatMap(isAttached -> Mono.error(
                new IllegalStateException("Policy with id %d is attached to a role".formatted(id))))
            .then(policyRepository.delete(id))
            .map(policyMapper::mapToPolicy);
    }
}
