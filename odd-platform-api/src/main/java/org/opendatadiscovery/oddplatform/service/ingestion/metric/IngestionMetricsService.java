package org.opendatadiscovery.oddplatform.service.ingestion.metric;

import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricSetList;
import reactor.core.publisher.Mono;

public interface IngestionMetricsService {
    Mono<Void> ingestMetrics(final MetricSetList metricSetList);
}
