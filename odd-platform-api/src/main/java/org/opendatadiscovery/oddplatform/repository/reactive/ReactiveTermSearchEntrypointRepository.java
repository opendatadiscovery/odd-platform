package org.opendatadiscovery.oddplatform.repository.reactive;

import reactor.core.publisher.Mono;

public interface ReactiveTermSearchEntrypointRepository {

    Mono<Integer> updateTermVectors(final long termId);

    Mono<Integer> updateChangedNamespaceVector(final long namespaceId);

    Mono<Integer> updateNamespaceVectorsForTerm(final long termId);

    Mono<Integer> updateTagVectorsForTerm(final long termId);

    Mono<Integer> updateChangedTagVectors(final long tagId);

    Mono<Integer> updateChangedOwnershipVectors(final long ownershipId);

    Mono<Integer> updateChangedOwnerVectors(final long ownerId);
}
