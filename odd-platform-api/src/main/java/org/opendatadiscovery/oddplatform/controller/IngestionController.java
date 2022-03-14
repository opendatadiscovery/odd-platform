package org.opendatadiscovery.oddplatform.controller;

import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
        return dataSourceList
            .publishOn(Schedulers.boundedElastic())
            .flatMap(model -> dataSourceIngestionService.createDataSourcesFromIngestion(model.getItems()))
            .map(ignored -> ResponseEntity.ok().build());
    }
}
