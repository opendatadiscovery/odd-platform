package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.ingestion.contract.api.IngestionApi;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.service.DataSourceService;
import org.opendatadiscovery.oddplatform.service.IngestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import javax.validation.Valid;

@RestController
@RequiredArgsConstructor
@Slf4j
public class IngestionController implements IngestionApi {
    private final IngestionService ingestionService;
    private final DataSourceService dataSourceService;

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
    public Mono<ResponseEntity<Void>> createDataSource(@Valid final Flux<DataSource> dataSource,
                                                       final ServerWebExchange exchange) {
        return dataSource.map(this::createForm)
            .collectList()
            .map(dataSourceService::bulkCreate)
            .map(__ -> ResponseEntity.ok().build());
    }

    private DataSourceFormData createForm(final DataSource ds) {
        return new DataSourceFormData()
            .oddrn(ds.getOddrn())
            .name(ds.getName())
            .active(true)
            .description(ds.getDescription());
    }
}
