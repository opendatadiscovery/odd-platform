package org.opendatadiscovery.oddplatform.service.metric;

import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import reactor.core.publisher.Mono;

public interface OTLPMetricService {
    Mono<IngestionRequest> exportMetrics(final IngestionRequest dataStructure);
}
