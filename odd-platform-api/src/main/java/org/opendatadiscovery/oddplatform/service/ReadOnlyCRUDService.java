package org.opendatadiscovery.oddplatform.service;

import reactor.core.publisher.Mono;

public interface ReadOnlyCRUDService<E, EL> {
    Mono<E> get(final long id);

    Mono<EL> list();

    Mono<EL> list(final String query);

    Mono<EL> list(final int page, final int size);

    Mono<EL> list(final int page, final int size, final String query);
}
