package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Policy;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyList;
import reactor.core.publisher.Mono;

public interface PolicyService {
    Mono<PolicyDetails> getPolicyDetails(final long id);

    Mono<PolicyList> list(final int page, final int size, final String query);

    Mono<PolicyDetails> create(final PolicyFormData formData);

    Mono<PolicyDetails> update(final long id, final PolicyFormData formData);

    Mono<Policy> delete(final long id);

    Mono<String> getPolicySchema();
}
