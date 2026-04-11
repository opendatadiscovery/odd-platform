package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import reactor.core.publisher.Mono;

public interface ReactiveOwnerToRoleRepository {
    Mono<Void> createRelations(final long ownerId, final Collection<Long> roleIds);

    Mono<Boolean> isRoleAttachedToOwner(final long roleId);

    Mono<Void> deleteOwnerRelationsExcept(final long ownerId, final Collection<Long> roleIds);
}
