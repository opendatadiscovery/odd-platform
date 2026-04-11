package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRelationshipDetailsList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRelationshipList;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import reactor.core.publisher.Mono;

public interface RelationshipsService {
    Mono<DataEntityRelationshipDetailsList> getRelationsByDatasetId(final Long dataEntityId,
                                                                    final RelationshipsType type);

    Mono<DataEntityRelationshipList> getRelationships(final Integer page,
                                                      final Integer size,
                                                      final RelationshipsType type,
                                                      final String query);

    Mono<DataEntityRelationshipDetails> getERDRelationshipById(final Long relationshipId);

    Mono<DataEntityRelationshipDetails> getGraphRelationshipById(final Long relationshipId);
}
