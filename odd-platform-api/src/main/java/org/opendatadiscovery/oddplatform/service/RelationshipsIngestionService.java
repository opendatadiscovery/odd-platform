package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.ingestion.contract.model.RelationshipList;
import reactor.core.publisher.Mono;

public interface RelationshipsIngestionService {
    Mono<Void> ingestRelationships(final RelationshipList item);
}
