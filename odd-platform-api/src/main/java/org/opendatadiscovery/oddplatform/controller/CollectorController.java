package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class CollectorController implements CollectorApi {
    private final CollectorService collectorService;

    @Override
    public Mono<ResponseEntity<CollectorList>> getCollectorsList(final Integer page,
                                                                 final Integer size,
                                                                 final String query,
                                                                 final ServerWebExchange exchange) {
        return collectorService.list(page, size, query).map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Collector>> registerCollector(final Mono<CollectorFormData> collectorFormData,
                                                             final ServerWebExchange exchange) {
        return collectorFormData.flatMap(collectorService::create).map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Collector>> updateCollector(final Long collectorId,
                                                           final Mono<CollectorUpdateFormData> collectorUpdateFormData,
                                                           final ServerWebExchange exchange) {
        return collectorUpdateFormData
            .flatMap(form -> collectorService.update(collectorId, form))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteCollector(final Long collectorId, final ServerWebExchange exchange) {
        return collectorService.delete(collectorId).map(ign -> ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<Collector>> regenerateCollectorToken(final Long collectorId,
                                                                    final ServerWebExchange exchange) {
        return collectorService.regenerateToken(collectorId).map(ResponseEntity::ok);
    }
}
