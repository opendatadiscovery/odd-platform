package org.opendatadiscovery.oddplatform.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.MultiValuedMap;
import org.opendatadiscovery.oddplatform.api.contract.api.DataQualityApi;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverityForm;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetTestReport;
import org.opendatadiscovery.oddplatform.dto.SLA;
import org.opendatadiscovery.oddplatform.service.DataQualityService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.server.ServerRequest;
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
    @CrossOrigin
    public Mono<ResponseEntity<String>> getSLA(final Long dataEntityId,
                                               final ServerWebExchange exchange) {
        final HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.put("X-Frame-Options", List.of("allow"));

        return dataQualityService
            .getSLA(dataEntityId)
            .map(this::generateSLAHtml)
            .map(html -> new ResponseEntity<>(html, httpHeaders, HttpStatus.OK));
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

    private String generateSLAHtml(final SLA sla) {
        return """
                <!DOCTYPE html>
                <html>
                <body>
                <svg width="100" height="100">
                  <rect width="100" height="100"
                  style="fill:%s" />
                </svg>
                </body>
                </html>
            """.formatted(sla.toString());
    }
}