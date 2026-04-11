package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.PolicyApi;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyList;
import org.opendatadiscovery.oddplatform.service.PolicyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class PolicyController implements PolicyApi {
    private final PolicyService policyService;

    @Override
    public Mono<ResponseEntity<PolicyDetails>> createPolicy(final Mono<PolicyFormData> policyFormData,
                                                            final ServerWebExchange exchange) {
        return policyFormData
            .flatMap(policyService::create)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<PolicyDetails>> getPolicyDetails(final Long policyId,
                                                                final ServerWebExchange exchange) {
        return policyService.getPolicyDetails(policyId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<PolicyList>> getPolicyList(final Integer page,
                                                          final Integer size,
                                                          final String query,
                                                          final ServerWebExchange exchange) {
        return policyService.list(page, size, query)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<PolicyDetails>> updatePolicy(final Long policyId,
                                                            final Mono<PolicyFormData> policyFormData,
                                                            final ServerWebExchange exchange) {
        return policyFormData
            .flatMap(formData -> policyService.update(policyId, formData))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deletePolicy(final Long policyId,
                                                   final ServerWebExchange exchange) {
        return policyService.delete(policyId)
            .thenReturn(ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<String>> getPolicySchema(final ServerWebExchange exchange) {
        return policyService.getPolicySchema()
            .map(ResponseEntity::ok);
    }
}
