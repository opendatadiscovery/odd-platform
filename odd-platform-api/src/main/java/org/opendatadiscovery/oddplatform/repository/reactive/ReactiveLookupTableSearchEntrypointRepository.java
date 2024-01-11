package org.opendatadiscovery.oddplatform.repository.reactive;

import reactor.core.publisher.Mono;

public interface ReactiveLookupTableSearchEntrypointRepository {
    Mono<Integer> updateLookupTableVectors(final Long tableId);

    Mono<Integer> updateNamespaceSearchVectors(final Long tableId);

    Mono<Integer> updateTableDefinitionSearchVectors(final Long tableId);

    Mono<Void> deleteByTableId(final Long tableId);
}
