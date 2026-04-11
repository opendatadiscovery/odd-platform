package org.opendatadiscovery.oddplatform.repository.metric;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricPointPojo;
import reactor.core.publisher.Flux;

public interface MetricPointRepository {
    Flux<MetricPointPojo> getPointsBySeriesId(final List<Integer> seriesIds);

    Flux<MetricPointPojo> deletePoints(final List<MetricPointPojo> pointsToDelete);

    Flux<MetricPointPojo> createOrUpdatePoints(final List<MetricPointPojo> metricPoints);
}
