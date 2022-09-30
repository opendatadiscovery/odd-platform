package org.opendatadiscovery.oddplatform.controller;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.auth.session.SessionConstants;
import org.opendatadiscovery.oddplatform.ingestion.contract.api.IngestionApi;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.CompactDataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.service.DataEntityService;
import org.opendatadiscovery.oddplatform.service.DataSourceIngestionService;
import org.opendatadiscovery.oddplatform.service.ingestion.IngestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import static reactor.function.TupleUtils.function;

@RestController
@RequiredArgsConstructor
@Slf4j
public class IngestionController implements IngestionApi {
    private final IngestionService ingestionService;
    private final DataEntityService dataEntityService;
    private final DataSourceIngestionService dataSourceIngestionService;

    @Override
    public Mono<ResponseEntity<Void>> postDataEntityList(
        @Valid final Mono<DataEntityList> dataEntityList,
        final ServerWebExchange exchange
    ) {
        return dataEntityList
            .flatMap(ingestionService::ingest)
            .thenReturn(ResponseEntity.ok().build());
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
            .flatMapMany(function(
                (dataSources, collectorId) -> dataSourceIngestionService.createDataSources(collectorId, dataSources)))
            .then(Mono.just(ResponseEntity.ok().build()));
    }

    @Override
    public Mono<ResponseEntity<CompactDataEntityList>> getDataEntitiesByDEGOddrn(@NotNull @Valid final String degOddrn,
                                                                                 final ServerWebExchange exchange) {
        return dataEntityService.listEntitiesWithinDEG(degOddrn).map(ResponseEntity::ok);
    }
}
