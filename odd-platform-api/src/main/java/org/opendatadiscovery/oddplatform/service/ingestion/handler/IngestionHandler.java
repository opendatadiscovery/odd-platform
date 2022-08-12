package org.opendatadiscovery.oddplatform.service.ingestion.handler;

import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionDataStructure;
import reactor.core.publisher.Mono;

public interface IngestionHandler {
    Mono<Void> handle(final IngestionDataStructure dataStructure);
}
