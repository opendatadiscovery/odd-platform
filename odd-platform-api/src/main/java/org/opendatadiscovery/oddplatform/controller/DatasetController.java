package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DataSetApi;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetVersionDiffList;
import org.opendatadiscovery.oddplatform.api.contract.model.ERDRelationshipDetailsList;
import org.opendatadiscovery.oddplatform.api.contract.model.GraphRelationshipDetailsList;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipList;
import org.opendatadiscovery.oddplatform.service.DatasetVersionService;
import org.opendatadiscovery.oddplatform.service.ERDRelationshipsService;
import org.opendatadiscovery.oddplatform.service.GraphRelationshipsService;
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
    private final ERDRelationshipsService erdRelationshipsService;
    private final GraphRelationshipsService graphRelationshipsService;

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
    public Mono<ResponseEntity<RelationshipList>> getDataSetRelationships(final Long dataEntityId,
                                                                          final ServerWebExchange exchange) {
        return relationshipsService.getRelationsByDatasetId(dataEntityId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<ERDRelationshipDetailsList>>
        getDataSetErdRelationshipsById(final Long dataEntityId,
                                   final Long relationshipsId,
                                   final ServerWebExchange exchange) {
        return erdRelationshipsService.getDataSetErdRelationshipsById(dataEntityId, relationshipsId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<GraphRelationshipDetailsList>>
        getDataSetGraphRelationshipsById(final Long dataEntityId,
                                     final Long relationshipsId,
                                     final ServerWebExchange exchange) {
        return graphRelationshipsService.getDataSetGraphRelationshipsById(relationshipsId)
            .map(ResponseEntity::ok);
    }
}
