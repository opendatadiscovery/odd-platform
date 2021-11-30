package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.ReadOnlyCRUDMapperWithList;
import org.opendatadiscovery.oddplatform.repository.CRUDRepository;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public abstract class AbstractReadOnlyCRUDService<E, EL, P, M
    extends ReadOnlyCRUDMapperWithList<E, EL, P>, R extends CRUDRepository<P>>
    implements ReadOnlyCRUDService<E, EL> {
    protected final M entityMapper;
    protected final R entityRepository;

    @Override
    public Mono<E> get(final long id) {
        return Mono.fromCallable(() -> entityRepository.get(id))
            .flatMap(optional -> optional.isEmpty()
                ? Mono.error(new NotFoundException())
                : Mono.just(optional.get()))
            .map(entityMapper::mapPojo);
    }

    public Mono<EL> list() {
        return Mono.fromCallable(entityRepository::list)
            .map(entityMapper::mapPojos);
    }

    @Override
    public Mono<EL> list(final String query) {
        return Mono.fromCallable(() -> entityRepository.list(query))
            .map(entityMapper::mapPojos);
    }

    @Override
    public Mono<EL> list(final int page, final int size) {
        return Mono
            .fromCallable(() -> entityRepository.list(page, size, null))
            .map(entityMapper::mapPojos);
    }

    @Override
    public Mono<EL> list(final int page, final int size, final String query) {
        return Mono
            .fromCallable(() -> entityRepository.list(page, size, query))
            .map(entityMapper::mapPojos);
    }
}
