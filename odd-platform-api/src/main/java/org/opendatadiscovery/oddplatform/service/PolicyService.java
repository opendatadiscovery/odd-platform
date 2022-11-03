package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.Policy;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyList;
import org.opendatadiscovery.oddplatform.model.tables.pojos.PolicyPojo;
import reactor.core.publisher.Mono;

public interface PolicyService {
    Mono<PolicyDetails> getPolicyDetails(final long id);

    Mono<PolicyList> list(final int page, final int size, final String query);

    Mono<PolicyDetails> create(final PolicyFormData formData);

    Mono<PolicyDetails> update(final long id, final PolicyFormData formData);

    Mono<Policy> delete(final long id);

    Mono<String> getPolicySchema();

    Mono<List<PolicyPojo>> getCurrentUserPolicies();
}
