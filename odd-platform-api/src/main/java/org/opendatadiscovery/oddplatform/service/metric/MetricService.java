package org.opendatadiscovery.oddplatform.service.metric;

import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import reactor.core.publisher.Mono;

public interface MetricService {
    Mono<IngestionRequest> exportMetrics(final IngestionRequest dataStructure);
}
