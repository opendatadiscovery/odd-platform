package org.opendatadiscovery.oddplatform.service.metric;

import org.opendatadiscovery.oddplatform.dto.IngestionDataStructure;
import reactor.core.publisher.Mono;

public interface MetricService {
    Mono<IngestionDataStructure> exportMetrics(final IngestionDataStructure dataStructure);
}
