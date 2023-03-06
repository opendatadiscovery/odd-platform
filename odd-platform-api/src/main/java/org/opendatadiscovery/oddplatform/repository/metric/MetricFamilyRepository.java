package org.opendatadiscovery.oddplatform.repository.metric;

import java.util.Collection;
import java.util.Set;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import reactor.core.publisher.Flux;

public interface MetricFamilyRepository {
    Flux<MetricFamilyPojo> createOrUpdateMetricFamilies(final Collection<MetricFamilyPojo> metricFamilies);

    Flux<MetricFamilyPojo> getByIds(final Set<Integer> ids);
}
