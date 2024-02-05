package org.opendatadiscovery.oddplatform.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DataQualityRunsApi;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityResults;
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
    public Mono<ResponseEntity<DataQualityResults>> getDataQualityTestsRuns(final List<Long> namespaceId,
                                                                            final List<Long> datasourceId,
                                                                            final List<Long> ownerId,
                                                                            final List<Long> titleId,
                                                                            final List<Long> tagId,
                                                                            final List<Long> deNamespaceId,
                                                                            final List<Long> deDatasourceId,
                                                                            final List<Long> deOwnerId,
                                                                            final List<Long> deTitleId,
                                                                            final List<Long> deTagId,
                                                                            final ServerWebExchange exchange) {
        return service.getDataQualityTestsRuns(namespaceId, datasourceId, ownerId, titleId, tagId,
                deNamespaceId, deDatasourceId, deOwnerId, deTitleId, deTagId)
            .map(ResponseEntity::ok);
    }
}
