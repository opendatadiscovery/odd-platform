package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationship;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationshipList;
import reactor.core.publisher.Mono;

public interface RelationshipsService {
    Mono<DatasetRelationshipList> getRelationsByDatasetId(final Long dataEntityId);

    Mono<DatasetRelationship> getRelationshipById(final Long relationshipId);
}
