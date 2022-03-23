package org.opendatadiscovery.oddplatform.controller;

import org.opendatadiscovery.oddplatform.api.contract.api.CollectorApi;
import org.opendatadiscovery.oddplatform.api.contract.model.Collector;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorList;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorUpdateFormData;
import org.opendatadiscovery.oddplatform.service.CollectorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
public class CollectorController extends AbstractCRUDController<Collector, CollectorList, CollectorFormData,
    CollectorUpdateFormData, CollectorService> implements CollectorApi {

    public CollectorController(final CollectorService collectorService) {
        super(collectorService);
    }

    @Override
    public Mono<ResponseEntity<CollectorList>> getCollectorsList(final Integer page, final Integer size,
                                                                 final String query,
                                                                 final ServerWebExchange exchange) {
        return list(page, size, query);
    }

    @Override
    public Mono<ResponseEntity<Collector>> registerCollector(final Mono<CollectorFormData> collectorFormData,
                                                             final ServerWebExchange exchange) {
        return create(collectorFormData);
    }

    @Override
    public Mono<ResponseEntity<Collector>> updateCollector(final Long collectorId,
                                                           final Mono<CollectorUpdateFormData> collectorUpdateFormData,
                                                           final ServerWebExchange exchange) {
        return update(collectorId, collectorUpdateFormData);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteCollector(final Long collectorId, final ServerWebExchange exchange) {
        return delete(collectorId);
    }

    @Override
    public Mono<ResponseEntity<Collector>> regenerateCollectorToken(final Long collectorId,
                                                                    final ServerWebExchange exchange) {
        return entityService.regenerateDataSourceToken(collectorId)
            .map(ResponseEntity::ok);
    }
}
