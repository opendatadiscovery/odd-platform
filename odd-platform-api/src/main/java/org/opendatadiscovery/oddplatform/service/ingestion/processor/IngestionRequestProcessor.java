package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import reactor.core.publisher.Mono;

public interface IngestionRequestProcessor {
    Mono<Void> process(final IngestionRequest request);

    boolean shouldProcess(final IngestionRequest request);

    default IngestionProcessingPhase getPhase() {
        return IngestionProcessingPhase.MAIN;
    }
}
