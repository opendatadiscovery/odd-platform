package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.GraphRelationshipDetailsList;
import reactor.core.publisher.Mono;

public interface GraphRelationshipsService {
    Mono<GraphRelationshipDetailsList> getDataSetGraphRelationshipsById(final Long relationshipsId);
}
