package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DataQualityApi;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverityForm;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetTestReport;
import org.opendatadiscovery.oddplatform.dto.SLA;
import org.opendatadiscovery.oddplatform.service.DataQualityService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequiredArgsConstructor
public class DataQualityController implements DataQualityApi {
    @Value("classpath:sla/sla_green.png")
    private Resource greenSLAResource;

    @Value("classpath:sla/sla_yellow.png")
    private Resource yellowSLAResource;

    @Value("classpath:sla/sla_red.png")
    private Resource redSLAResource;

    private final DataQualityService dataQualityService;

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
            .map(this::resolveSLAResource)
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

    private Resource resolveSLAResource(final SLA sla) {
        return switch (sla) {
            case RED -> redSLAResource;
            case YELLOW -> yellowSLAResource;
            case GREEN -> greenSLAResource;
        };
    }
}