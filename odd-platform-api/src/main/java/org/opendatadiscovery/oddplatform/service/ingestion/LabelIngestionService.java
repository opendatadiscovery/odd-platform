package org.opendatadiscovery.oddplatform.service.ingestion;

import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import reactor.core.publisher.Mono;

public interface LabelIngestionService {
    Mono<Void> ingestExternalLabels(final IngestionRequest dataStructure);
}
