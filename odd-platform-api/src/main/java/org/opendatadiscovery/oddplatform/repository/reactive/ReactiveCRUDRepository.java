package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveCRUDRepository<POJO> {
    Mono<POJO> get(final long id);

    Flux<POJO> list();

    Flux<POJO> list(final String query);

    Mono<Page<POJO>> list(final int page, final int size, final String query);

    Mono<POJO> create(final POJO pojo);

    Mono<POJO> update(final POJO pojo);

    Flux<POJO> bulkCreate(final Collection<POJO> pojos);

    Flux<POJO> bulkUpdate(final Collection<POJO> pojos);

    Mono<POJO> delete(final long id);

    Flux<POJO> delete(final Collection<Long> ids);
}
