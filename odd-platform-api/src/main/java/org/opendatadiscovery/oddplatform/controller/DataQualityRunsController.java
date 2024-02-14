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
    public Mono<ResponseEntity<DataQualityResults>> getDataQualityTestsRuns(final List<Long> namespaceIds,
                                                                            final List<Long> datasourceIds,
                                                                            final List<Long> ownerIds,
                                                                            final List<Long> titleIds,
                                                                            final List<Long> tagIds,
                                                                            final List<Long> deNamespaceIds,
                                                                            final List<Long> deDatasourceIds,
                                                                            final List<Long> deOwnerIds,
                                                                            final List<Long> deTitleIds,
                                                                            final List<Long> deTagIds,
                                                                            final ServerWebExchange exchange) {
        return service.getDataQualityTestsRuns(namespaceIds, datasourceIds, ownerIds, titleIds, tagIds,
                deNamespaceIds, deDatasourceIds, deOwnerIds, deTitleIds, deTagIds)
            .map(ResponseEntity::ok);
    }
}
