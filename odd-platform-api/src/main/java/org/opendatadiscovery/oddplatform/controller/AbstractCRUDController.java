package org.opendatadiscovery.oddplatform.controller;

import org.opendatadiscovery.oddplatform.service.CRUDService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

public abstract class AbstractCRUDController<E, EL, CEF, UEF, S extends CRUDService<E, EL, CEF, UEF>>
    extends AbstractReadOnlyController<E, EL, S> {

    public AbstractCRUDController(final S entityService) {
        super(entityService);
    }

    protected Mono<ResponseEntity<E>> create(final Mono<CEF> createEntityForm) {
        return createEntityForm
            .publishOn(Schedulers.boundedElastic())
            .flatMap(entityService::create)
            .map(entity -> new ResponseEntity<>(entity, HttpStatus.CREATED));
    }

    protected Mono<ResponseEntity<E>> update(final long id, final Mono<UEF> updateEntityForm) {
        return updateEntityForm
            .publishOn(Schedulers.boundedElastic())
            .flatMap(form -> entityService.update(id, form))
            .map(entity -> new ResponseEntity<>(entity, HttpStatus.OK));
    }

    protected Mono<ResponseEntity<Void>> delete(final long id) {
        return entityService.delete(id)
            .subscribeOn(Schedulers.boundedElastic())
            .map(m -> ResponseEntity.noContent().build());
    }
}
