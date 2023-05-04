package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveOwnershipRepository {
    Mono<OwnershipDto> get(final long id);

    Mono<OwnershipPojo> create(final OwnershipPojo pojo);

    Flux<OwnershipPojo> createOrUpdate(final Collection<OwnershipPojo> ownerships);

    Mono<OwnershipPojo> delete(final long ownershipId);

    Flux<OwnershipPojo> deleteByDataEntityAndOwner(final Collection<OwnershipPojo> ownerships);

    Mono<OwnershipPojo> updateTitle(final long ownershipId, final long titleId);

    Mono<Boolean> existsByOwner(final long ownerId);

    Flux<OwnershipPojo> deleteByDataEntityId(final long dataEntityId);

    Flux<OwnershipDto> getOwnershipsByDataEntityId(final long dataEntityId);
}
