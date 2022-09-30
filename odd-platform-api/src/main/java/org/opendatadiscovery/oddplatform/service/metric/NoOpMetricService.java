package org.opendatadiscovery.oddplatform.service.metric;

import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@ConditionalOnProperty(value = "metrics.export.enabled", havingValue = "false")
@Component
public class NoOpMetricService implements MetricService {
    @Override
    public Mono<IngestionRequest> exportMetrics(final IngestionRequest dataStructure) {
        return Mono.just(dataStructure);
    }
}
