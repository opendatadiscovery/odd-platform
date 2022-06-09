package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import reactor.core.publisher.Mono;

public interface ReactiveDataEntityRepository extends ReactiveCRUDRepository<DataEntityPojo> {
    Mono<Boolean> exists(final long dataEntityId);

    Mono<Boolean> existsByDataSourceId(final long dataSourceId);

    Mono<Boolean> existsByNamespaceId(final long namespaceId);
}
