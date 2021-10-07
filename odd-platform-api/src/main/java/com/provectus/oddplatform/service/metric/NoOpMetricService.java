package com.provectus.oddplatform.service.metric;

import com.provectus.oddplatform.dto.IngestionDataStructure;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@ConditionalOnProperty(value = "metrics.export.enabled", havingValue = "false")
@Component
public class NoOpMetricService implements MetricService {
    @Override
    public Mono<IngestionDataStructure> exportMetrics(final IngestionDataStructure dataStructure) {
        return Mono.just(dataStructure);
    }
}
