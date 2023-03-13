package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.MetricSet;
import reactor.core.publisher.Mono;

public interface MetricReader {
    Mono<MetricSet> getLatestMetricsForOddrn(final String oddrn);
}
