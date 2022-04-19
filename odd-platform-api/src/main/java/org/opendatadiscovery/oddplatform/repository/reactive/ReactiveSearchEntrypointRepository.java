package org.opendatadiscovery.oddplatform.repository.reactive;

import reactor.core.publisher.Mono;

public interface ReactiveSearchEntrypointRepository {
    Mono<Integer> updateNamespaceVector(final long namespaceId);

    Mono<Integer> clearNamespaceVector(final long dataSourceId);

    Mono<Integer> updateDataSourceVector(final long dataSourceId);
}
