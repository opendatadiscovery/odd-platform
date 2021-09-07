package com.provectus.oddplatform.service;

import com.provectus.oddplatform.exception.NotFoundException;
import com.provectus.oddplatform.mapper.CRUDMapper;
import com.provectus.oddplatform.repository.CRUDRepository;
import java.util.List;
import java.util.stream.Collectors;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public abstract class AbstractCRUDService<E, EL, CEF, UEF, P, M
    extends CRUDMapper<E, EL, CEF, UEF, P>, CR extends CRUDRepository<P>>
    extends AbstractReadOnlyCRUDService<E, EL, P, M, CR>
    implements CRUDService<E, EL, CEF, UEF> {

    public AbstractCRUDService(final M entityMapper,
                               final CR entityRepository) {
        super(entityMapper, entityRepository);
    }

    @Override
    public Mono<E> create(final CEF createEntityForm) {
        return Mono.just(entityMapper.mapForm(createEntityForm))
            .map(entityRepository::create)
            .map(entityMapper::mapPojo);
    }

    @Override
    public Flux<E> bulkCreate(final List<CEF> forms) {
        final List<P> pojos = forms.stream()
            .map(entityMapper::mapForm)
            .collect(Collectors.toList());

        return Flux
            .fromIterable(entityRepository.bulkCreate(pojos))
            .map(entityMapper::mapPojo);
    }

    @Override
    public Mono<E> update(final long id, final UEF updateEntityForm) {
        return Mono.fromCallable(() -> entityRepository.get(id))
            .flatMap(optional -> optional.isEmpty()
                ? Mono.error(new NotFoundException())
                : Mono.just(optional.get()))
            .map(pojo -> {
                final P updatedPojo = entityMapper.applyForm(pojo, updateEntityForm);
                return entityMapper.mapPojo(entityRepository.update(updatedPojo));
            });
    }

    @Override
    public Mono<Long> delete(final long id) {
        return Mono.fromCallable(() -> {
            entityRepository.delete(id);
            return id;
        });
    }
}
