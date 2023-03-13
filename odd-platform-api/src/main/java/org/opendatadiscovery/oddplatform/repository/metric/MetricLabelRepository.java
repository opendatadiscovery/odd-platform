package org.opendatadiscovery.oddplatform.repository.metric;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelPojo;
import reactor.core.publisher.Flux;

public interface MetricLabelRepository {
    Flux<MetricLabelPojo> getOrCreateMetricLabels(final List<MetricLabelPojo> metricLabels);
}
