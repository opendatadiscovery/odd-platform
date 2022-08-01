package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import reactor.core.publisher.Mono;

public interface ReactiveDataEntityRepository extends ReactiveCRUDRepository<DataEntityPojo> {
    Mono<Boolean> exists(final long dataEntityId);

    Mono<Boolean> existsByDataSourceId(final long dataSourceId);

    Mono<Boolean> existsByNamespaceId(final long namespaceId);

    Mono<DataEntityDimensionsDto> getDataEntityWithNamespace(final long dataEntityId);

    Mono<List<DataEntityPojo>> getDEGEntities(final String groupOddrn);

    Mono<DataEntityPojo> setInternalName(final long dataEntityId, final String name);

    Mono<DataEntityPojo> setInternalDescription(final long dataEntityId, final String description);
}
