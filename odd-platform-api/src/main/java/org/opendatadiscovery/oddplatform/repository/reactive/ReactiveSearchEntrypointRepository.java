package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import reactor.core.publisher.Mono;

public interface ReactiveSearchEntrypointRepository {
    Mono<Integer> updateNamespaceVector(final long namespaceId);

    Mono<Integer> clearNamespaceVector(final long dataSourceId);

    Mono<Integer> updateDataSourceVector(final long dataSourceId);

    Mono<Integer> updateTagVectorsForDataEntity(final Long dataEntityId);

    Mono<Integer> updateChangedTagVectors(final long tagId);
}
