package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface CRUDService<E, EL, CEF, UEF> extends ReadOnlyCRUDService<E, EL> {
    Mono<E> create(final CEF createEntityForm);

    Flux<E> bulkCreate(final List<CEF> forms);

    Mono<E> update(final long id, final UEF updateEntityForm);

    Mono<Long> delete(final long id);
}
