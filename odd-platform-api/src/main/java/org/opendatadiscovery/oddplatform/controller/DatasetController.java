package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DataSetApi;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRelationshipDetailsList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersionDiffList;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import org.opendatadiscovery.oddplatform.service.DatasetVersionService;
import org.opendatadiscovery.oddplatform.service.RelationshipsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class DatasetController implements DataSetApi {
    private final DatasetVersionService datasetVersionService;
    private final RelationshipsService relationshipsService;

    @Override
    public Mono<ResponseEntity<DataSetStructure>> getDataSetStructureByVersionId(
        final Long dataEntityId,
        final Long versionId,
        final ServerWebExchange exchange
    ) {
        return datasetVersionService
            .getDatasetVersion(dataEntityId, versionId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataSetStructure>> getDataSetStructureLatest(
        final Long dataEntityId,
        final ServerWebExchange exchange
    ) {
        return datasetVersionService
            .getLatestDatasetVersion(dataEntityId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataSetVersionDiffList>> getDataSetStructureDiff(final Long dataEntityId,
                                                                                final Long firstVersionId,
                                                                                final Long secondVersionId,
                                                                                final ServerWebExchange exchange) {
        return datasetVersionService.getDatasetVersionDiff(dataEntityId, firstVersionId, secondVersionId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntityRelationshipDetailsList>>
        getDataSetRelationships(final Long dataEntityId,
                                final RelationshipsType type,
                                final ServerWebExchange exchange) {
        return relationshipsService.getRelationsByDatasetId(dataEntityId, type)
            .map(ResponseEntity::ok);
    }
}
