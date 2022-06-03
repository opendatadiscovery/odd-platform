package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.term.TermOwnershipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermOwnershipPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveTermOwnershipRepository {
    Mono<TermOwnershipDto> get(final long id);

    Mono<TermOwnershipPojo> create(final TermOwnershipPojo pojo);

    Mono<TermOwnershipPojo> delete(final long ownershipId);

    Mono<TermOwnershipPojo> updateRole(final long ownershipId, final long roleId);

    Mono<Boolean> existsByOwner(final long ownerId);
}
