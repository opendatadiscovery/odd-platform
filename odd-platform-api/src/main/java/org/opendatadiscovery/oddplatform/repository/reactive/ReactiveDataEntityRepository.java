package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveDataEntityRepository extends ReactiveCRUDRepository<DataEntityPojo> {
    Flux<DataEntityPojo> get(final List<Long> ids);

    Mono<Boolean> exists(final long dataEntityId);

    Mono<Boolean> existsByDataSourceId(final long dataSourceId);

    Mono<Boolean> existsByNamespaceId(final long namespaceId);

    Flux<DataEntityPojo> listAllByOddrns(final Collection<String> oddrns);

    Mono<DataEntityDimensionsDto> getDataEntityWithNamespace(final long dataEntityId);

    Mono<List<DataEntityPojo>> getDEGEntities(final String groupOddrn);

    Mono<Void> createHollow(final Collection<String> hollowOddrns);

    Mono<DataEntityPojo> setInternalName(final long dataEntityId, final String name);

    Mono<DataEntityPojo> setInternalDescription(final long dataEntityId, final String description);

    Mono<Boolean> userIsDataEntityOwner(final long dataEntityId, final String username);
}
