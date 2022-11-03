package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.OwnerDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Mono;

public interface ReactiveOwnerRepository extends ReactiveCRUDRepository<OwnerPojo> {
    Mono<OwnerDto> getDto(final Long id);

    Mono<Page<OwnerDto>> list(final int page,
                              final int size,
                              final String query,
                              final List<Long> ids,
                              final Boolean allowedForSync);

    Mono<OwnerPojo> getByName(final String name);
}
