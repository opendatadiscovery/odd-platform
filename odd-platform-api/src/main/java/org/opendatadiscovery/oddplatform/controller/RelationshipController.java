package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.RelationshipApi;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetERDRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetGraphRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationshipList;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import org.opendatadiscovery.oddplatform.service.RelationshipsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class RelationshipController implements RelationshipApi {
    private final RelationshipsService relationshipsService;

    @Override
    public Mono<ResponseEntity<DatasetRelationshipList>> getRelationships(final Integer page,
                                                                          final Integer size,
                                                                          final RelationshipsType type,
                                                                          final String query,
                                                                          final ServerWebExchange exchange) {
        return relationshipsService.getRelationships(page, size, type, query)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DatasetERDRelationshipDetails>>
        getERDRelationshipById(final Long relationshipId,
                               final ServerWebExchange exchange) {
        return relationshipsService.getERDRelationshipById(relationshipId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DatasetGraphRelationshipDetails>>
        getGraphRelationshipById(final Long relationshipId,
                                 final ServerWebExchange exchange) {
        return relationshipsService.getGraphRelationshipById(relationshipId)
            .map(ResponseEntity::ok);
    }
}
