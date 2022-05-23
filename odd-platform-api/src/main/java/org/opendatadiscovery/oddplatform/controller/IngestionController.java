package org.opendatadiscovery.oddplatform.controller;

import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.auth.filter.SessionConstants;
import org.opendatadiscovery.oddplatform.ingestion.contract.api.IngestionApi;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.service.DataSourceIngestionService;
import org.opendatadiscovery.oddplatform.service.IngestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequiredArgsConstructor
@Slf4j
public class IngestionController implements IngestionApi {
    private final IngestionService ingestionService;
    private final DataSourceIngestionService dataSourceIngestionService;

    @Override
    public Mono<ResponseEntity<Void>> postDataEntityList(
        @Valid final Mono<DataEntityList> dataEntityList,
        final ServerWebExchange exchange
    ) {
        return dataEntityList
            .publishOn(Schedulers.boundedElastic())
            .doOnError(t -> log.error(t.getMessage()))
            .flatMap(ingestionService::ingest)
            .map(voidMono -> ResponseEntity.ok().build());
    }

    @Override
    public Mono<ResponseEntity<Void>> createDataSource(@Valid final Mono<DataSourceList> dataSourceList,
                                                       final ServerWebExchange exchange) {
        final Mono<Long> collectorIdMono = exchange.getSession()
            .map(ws -> {
                final Object collectorId = ws.getAttribute(SessionConstants.COLLECTOR_ID_SESSION_KEY);
                if (collectorId == null) {
                    throw new IllegalStateException("Collector id is null");
                }
                return collectorId;
            })
            .cast(Long.class);
        return dataSourceList
            .zipWhen(l -> collectorIdMono)
            .flatMapMany(t -> dataSourceIngestionService.createDataSources(t.getT2(), t.getT1()))
            .then(Mono.just(ResponseEntity.ok().build()));
    }
}
