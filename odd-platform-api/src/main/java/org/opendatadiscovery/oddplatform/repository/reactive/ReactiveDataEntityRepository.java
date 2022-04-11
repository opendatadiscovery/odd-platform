package org.opendatadiscovery.oddplatform.repository.reactive;

import reactor.core.publisher.Mono;

public interface ReactiveDataEntityRepository {
    Mono<Boolean> existsByDataSourceId(final long dataSourceId);
}
