package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import reactor.core.publisher.Mono;

public interface ReactiveNamespaceRepository extends ReactiveCRUDRepository<NamespacePojo> {
    Mono<NamespacePojo> getByName(final String name);

    Mono<NamespacePojo> createByName(final String name);
}
