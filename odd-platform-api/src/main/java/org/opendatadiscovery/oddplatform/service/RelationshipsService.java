package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DatasetERDRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetGraphRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationshipList;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import reactor.core.publisher.Mono;

public interface RelationshipsService {
    Mono<DatasetRelationshipList> getRelationsByDatasetId(final Long dataEntityId, final RelationshipsType type);

    Mono<DatasetRelationshipList> getRelationships(final Integer page,
                                                   final Integer size,
                                                   final RelationshipsType type,
                                                   final String query);

    Mono<DatasetERDRelationshipDetails> getERDRelationshipById(final Long relationshipId);

    Mono<DatasetGraphRelationshipDetails> getGraphRelationshipById(final Long relationshipId);
}
