package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import reactor.core.publisher.Mono;

public interface ReactiveOwnershipRepository {
    Mono<OwnershipDto> get(final long id);

    Mono<OwnershipPojo> create(final OwnershipPojo pojo);

    Mono<OwnershipPojo> delete(final long ownershipId);

    Mono<OwnershipPojo> updateRole(final long ownershipId, final long roleId);

    Mono<Boolean> existsByOwner(final long ownerId);
}
