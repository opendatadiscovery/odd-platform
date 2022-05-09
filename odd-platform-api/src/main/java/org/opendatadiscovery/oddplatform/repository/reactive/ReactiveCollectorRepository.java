package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.CollectorDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Mono;

public interface ReactiveCollectorRepository extends ReactiveCRUDRepository<CollectorPojo> {
    Mono<CollectorDto> getDto(final long id);

    Mono<Page<CollectorDto>> listDto(final int page, final int size, final String nameQuery);

    Mono<CollectorPojo> getByToken(final String token);

    Mono<Boolean> existsByNamespace(final long namespaceId);
}
