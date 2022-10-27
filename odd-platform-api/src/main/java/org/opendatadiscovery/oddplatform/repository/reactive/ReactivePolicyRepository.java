package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.PolicyPojo;
import reactor.core.publisher.Mono;

public interface ReactivePolicyRepository extends ReactiveCRUDRepository<PolicyPojo> {
    Mono<List<PolicyPojo>> getRolesPolicies(final List<Long> roleIds);
}
