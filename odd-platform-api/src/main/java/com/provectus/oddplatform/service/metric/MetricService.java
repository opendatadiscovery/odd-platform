package com.provectus.oddplatform.service.metric;

import com.provectus.oddplatform.dto.IngestionDataStructure;
import reactor.core.publisher.Mono;

public interface MetricService {
    Mono<IngestionDataStructure> exportMetrics(final IngestionDataStructure dataStructure);
}
