package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import reactor.core.publisher.Mono;

public interface ReactiveRoleToPolicyRepository {
    Mono<Void> createRelations(final long roleId, final Collection<Long> policyIds);

    Mono<Boolean> isPolicyAttachedToRole(final long policyId);

    Mono<Void> deleteRoleRelationsExcept(final long roleId, final Collection<Long> policyIds);
}
