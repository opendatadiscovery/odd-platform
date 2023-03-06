package org.opendatadiscovery.oddplatform.dto.metric;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricPointPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricSeriesPojo;

public record MetricSeriesDto(MetricSeriesPojo series,
                              List<MetricPointPojo> points) {
}