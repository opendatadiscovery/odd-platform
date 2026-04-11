package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.MetricSet;
import reactor.core.publisher.Mono;

public interface MetricService {
    Mono<MetricSet> getLatestMetricsForDataEntity(final long dataEntityId);

    Mono<MetricSet> getLatestMetricsForDatasetField(final long datasetFieldId);
}
