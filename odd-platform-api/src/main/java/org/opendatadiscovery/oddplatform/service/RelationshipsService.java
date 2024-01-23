package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationship;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationshipList;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import reactor.core.publisher.Mono;

public interface RelationshipsService {
    Mono<DatasetRelationshipList> getRelationsByDatasetId(final Long dataEntityId, final RelationshipsType type);

    Mono<DatasetRelationship> getRelationshipById(final Long relationshipId);

    Mono<DatasetRelationshipList> getRelationships(final Integer page,
                                                   final Integer size,
                                                   final RelationshipsType type,
                                                   final String query);
}
