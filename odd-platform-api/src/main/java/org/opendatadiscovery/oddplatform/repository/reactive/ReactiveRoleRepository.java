package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import reactor.core.publisher.Mono;

public interface ReactiveRoleRepository extends ReactiveCRUDRepository<RolePojo> {

    Mono<RolePojo> getByName(final String name);
}
