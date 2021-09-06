package com.provectus.oddplatform.controller;

import com.provectus.oddplatform.api.contract.api.DataQualityApi;
import com.provectus.oddplatform.api.contract.model.DataEntityList;
import com.provectus.oddplatform.api.contract.model.DataQualityTestRunList;
import com.provectus.oddplatform.api.contract.model.DataSetTestReport;
import com.provectus.oddplatform.service.DataQualityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequiredArgsConstructor
public class DataQualityController implements DataQualityApi {
    private final DataQualityService dataQualityService;

    @Override
    public Mono<ResponseEntity<DataEntityList>> getDataEntityDataQATests(final Long dataEntityId,
                                                                         final ServerWebExchange exchange) {
        return dataQualityService
                .getDataEntityDataQATests(dataEntityId)
                .subscribeOn(Schedulers.boundedElastic())
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataSetTestReport>> getDatasetTestReport(final Long dataEntityId,
                                                                        final ServerWebExchange exchange) {
        return dataQualityService
                .getDatasetTestReport(dataEntityId)
                .subscribeOn(Schedulers.boundedElastic())
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataQualityTestRunList>> getRuns(final Long dataEntityId,
                                                                final ServerWebExchange exchange) {
        return dataQualityService
                .getDataQualityTestRuns(dataEntityId)
                .subscribeOn(Schedulers.boundedElastic())
                .map(ResponseEntity::ok);
    }
}
