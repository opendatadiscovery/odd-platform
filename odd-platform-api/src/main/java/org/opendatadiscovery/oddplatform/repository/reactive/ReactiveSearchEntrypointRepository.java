package org.opendatadiscovery.oddplatform.repository.reactive;

import reactor.core.publisher.Mono;

public interface ReactiveSearchEntrypointRepository {
    Mono<Integer> updateChangedNamespaceVector(final long namespaceId);

    Mono<Integer> clearNamespaceVector(final long dataSourceId);

    Mono<Integer> updateDataSourceVector(final long dataSourceId);

    Mono<Integer> updateTagVectorsForDataEntity(final Long dataEntityId);

    Mono<Integer> updateChangedTagVectors(final long tagId);

    Mono<Integer> updateChangedOwnerVectors(final long ownerId);

    Mono<Integer> updateChangedOwnershipVectors(final long ownershipId);
}
