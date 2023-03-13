package org.opendatadiscovery.oddplatform.repository.metric;

import java.util.List;
import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.metric.MetricLabelValueDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelValuePojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MetricLabelValueRepository {
    Flux<MetricLabelValuePojo> getOrCreateMetricLabelValues(final List<MetricLabelValuePojo> metricLabelValues);

    Mono<List<MetricLabelValueDto>> getDtoByIds(final Set<Integer> ids);
}
