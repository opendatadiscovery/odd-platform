package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import reactor.core.publisher.Mono;

public interface ReactiveOwnerRepository extends ReactiveCRUDRepository<OwnerPojo> {

    Mono<OwnerPojo> getByName(final String name);
}
