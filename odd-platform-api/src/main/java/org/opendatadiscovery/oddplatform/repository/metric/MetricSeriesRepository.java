package org.opendatadiscovery.oddplatform.repository.metric;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricSeriesPojo;
import reactor.core.publisher.Flux;

public interface MetricSeriesRepository {
    Flux<MetricSeriesPojo> createOrUpdateMetricSeries(final List<MetricSeriesPojo> seriesPojos);

    Flux<MetricSeriesDto> getSeriesAndPointsByEntityOddrn(final String oddrn);
}
