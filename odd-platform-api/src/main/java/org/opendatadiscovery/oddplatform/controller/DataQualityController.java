package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DataQualityApi;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverityForm;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetSLAReport;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetTestReport;
import org.opendatadiscovery.oddplatform.service.DataQualityService;
import org.opendatadiscovery.oddplatform.service.SLAResourceResolver;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequiredArgsConstructor
public class DataQualityController implements DataQualityApi {
    private final DataQualityService dataQualityService;
    private final SLAResourceResolver slaResourceResolver;

    @Override
    public Mono<ResponseEntity<DataEntityList>> getDataEntityDataQATests(final Long dataEntityId,
                                                                         final ServerWebExchange exchange) {
        return dataQualityService
            .getDatasetTests(dataEntityId)
            // TODO: remove subscribeOn after
            //  https://github.com/opendatadiscovery/odd-platform/issues/623 is implemented
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataSetTestReport>> getDatasetTestReport(final Long dataEntityId,
                                                                        final ServerWebExchange exchange) {
        return dataQualityService
            .getDatasetTestReport(dataEntityId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Resource>> getSLA(final Long dataEntityId,
                                                 final ServerWebExchange exchange) {
        return dataQualityService
            .getSLA(dataEntityId)
            .map(slaResourceResolver::resolve)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntity>> setDataQATestSeverity(
        final Long dataEntityId,
        final Long dataqaTestId,
        final Mono<DataQualityTestSeverityForm> dataQualityTestSeverityForm,
        final ServerWebExchange exchange
    ) {
        return dataQualityTestSeverityForm
            .map(DataQualityTestSeverityForm::getSeverity)
            .flatMap(severity -> dataQualityService.setDataQualityTestSeverity(dataqaTestId, dataEntityId, severity))
            // TODO: remove subscribeOn after
            //  https://github.com/opendatadiscovery/odd-platform/issues/623 is implemented
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataSetSLAReport>> getDatasetSLAReport(final Long dataEntityId,
                                                                      final ServerWebExchange exchange) {
        return dataQualityService.getSLAReport(dataEntityId)
            .map(ResponseEntity::ok);
    }
}