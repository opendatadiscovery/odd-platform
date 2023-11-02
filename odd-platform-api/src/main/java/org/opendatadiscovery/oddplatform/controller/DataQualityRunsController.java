package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DataQualityRunsApi;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityCategoryResultsList;
import org.opendatadiscovery.oddplatform.service.DataQualityRunsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class DataQualityRunsController implements DataQualityRunsApi {
    private final DataQualityRunsService service;

    @Override
    public Mono<ResponseEntity<DataQualityCategoryResultsList>> getDataQualityTestsRuns(
            final ServerWebExchange exchange) {
        return service.getDataQualityTestsRuns()
                .map(ResponseEntity::ok);
    }
}
