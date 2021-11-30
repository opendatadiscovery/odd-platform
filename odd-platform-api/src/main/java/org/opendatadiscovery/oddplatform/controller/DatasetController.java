package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DataSetApi;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.service.DatasetVersionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequiredArgsConstructor
public class DatasetController implements DataSetApi {
    private final DatasetVersionService datasetVersionService;

    @Override
    public Mono<ResponseEntity<DataSetStructure>> getDataSetStructureByVersionId(
        final Long dataEntityId,
        final Long versionId,
        final ServerWebExchange exchange
    ) {
        return datasetVersionService
            .getDatasetVersion(dataEntityId, versionId)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataSetStructure>> getDataSetStructureLatest(
        final Long dataEntityId,
        final ServerWebExchange exchange
    ) {
        return datasetVersionService
            .getLatestDatasetVersion(dataEntityId)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }
}
