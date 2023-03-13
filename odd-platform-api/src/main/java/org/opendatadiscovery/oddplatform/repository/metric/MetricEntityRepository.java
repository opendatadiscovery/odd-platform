package org.opendatadiscovery.oddplatform.repository.metric;

import java.util.Set;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricEntityPojo;
import reactor.core.publisher.Flux;

public interface MetricEntityRepository {
    Flux<MetricEntityPojo> registerMetricEntityOddrns(final Set<String> oddrns);
}
