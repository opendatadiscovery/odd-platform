package org.opendatadiscovery.oddplatform.service.ingestion.rnd;

import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import reactor.core.publisher.Mono;

public interface AlertResolverService {
    Mono<Void> tryResolve(final IngestionRequest request);
}
