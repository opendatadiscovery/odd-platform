package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityERDRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGraphRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRelationshipList;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import reactor.core.publisher.Mono;

public interface RelationshipsService {
    Mono<DataEntityRelationshipList> getRelationsByDatasetId(final Long dataEntityId, final RelationshipsType type);

    Mono<DataEntityRelationshipList> getRelationships(final Integer page,
                                                   final Integer size,
                                                   final RelationshipsType type,
                                                   final String query);

    Mono<DataEntityERDRelationshipDetails> getERDRelationshipById(final Long relationshipId);

    Mono<DataEntityGraphRelationshipDetails> getGraphRelationshipById(final Long relationshipId);
}
