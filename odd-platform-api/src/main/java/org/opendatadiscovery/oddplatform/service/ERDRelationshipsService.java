package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.ERDRelationshipDetailsList;
import reactor.core.publisher.Mono;

public interface ERDRelationshipsService {
    Mono<ERDRelationshipDetailsList> getDataSetErdRelationshipsById(final Long dataEntityId,
                                                                    final Long relationshipsId);
}
