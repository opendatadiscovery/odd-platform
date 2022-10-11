package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.term.TermOwnershipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermOwnershipPojo;
import reactor.core.publisher.Mono;

public interface ReactiveTermOwnershipRepository {
    Mono<TermOwnershipDto> get(final long id);

    Mono<TermOwnershipPojo> create(final TermOwnershipPojo pojo);

    Mono<TermOwnershipPojo> delete(final long ownershipId);

    Mono<TermOwnershipPojo> updateTitle(final long ownershipId, final long titleId);

    Mono<Boolean> existsByOwner(final long ownerId);
}
