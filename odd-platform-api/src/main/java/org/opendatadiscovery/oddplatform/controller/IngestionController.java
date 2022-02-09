package org.opendatadiscovery.oddplatform.controller;

import javax.validation.Valid;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.ingestion.contract.api.IngestionApi;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.service.IngestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
public class IngestionController implements IngestionApi {
    private final IngestionService ingestionService;

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

    @PostMapping(
        path = "/ingestion/datasource",
        consumes = { "application/json" }
    )
    public Mono<ResponseEntity<List<CollectorDataSourceRequest>>> registerDataSources(
        @RequestBody final List<CollectorDataSourceRequest> request
    ) {
        return Mono.just(ResponseEntity.ok(request));
    }

    @Data
    @NoArgsConstructor
    private static class CollectorDataSourceRequest {
        private String name;
        private String oddrn;
        private String description;
        private String namespace;
    }
}
