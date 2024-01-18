package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationship;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipList;
import reactor.core.publisher.Mono;

public interface RelationshipsService {
    Mono<RelationshipList> getRelationsByDatasetId(final Long dataEntityId);

    Mono<DatasetRelationship> getRelationshipById(final Long relationshipId);
}
