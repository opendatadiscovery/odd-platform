package org.opendatadiscovery.oddplatform.repository.reactive;

import reactor.core.publisher.Mono;

public interface ReactiveTermSearchEntrypointRepository {

    Mono<Integer> updateTermVectors(final long termId);

    Mono<Integer> updateNamespaceVectors(final long termId);

    Mono<Integer> updateTagVectors(final long termId);

    Mono<Integer> updateOwnerVectors(final long termId, final long ownerId);
}
