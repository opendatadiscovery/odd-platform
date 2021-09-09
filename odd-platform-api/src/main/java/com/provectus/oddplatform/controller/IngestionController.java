package com.provectus.oddplatform.controller;

import com.provectus.oddplatform.ingestion.contract.api.IngestionApi;
import com.provectus.oddplatform.ingestion.contract.model.DataEntityList;
import com.provectus.oddplatform.service.IngestionService;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Override
    public Mono<ResponseEntity<Void>> postDataEntityList(
        @Valid final Mono<DataEntityList> dataEntityList,
        final ServerWebExchange exchange
    ) {
        return dataEntityList
            .publishOn(Schedulers.boundedElastic())
            .doOnError(t -> log.error(t.getMessage()))
            .map(list -> {
                ingestionService.ingest(list);
                return ResponseEntity.ok().build();
            });
    }
}
