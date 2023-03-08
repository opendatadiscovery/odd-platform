package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricFamily;
import org.opendatadiscovery.oddplatform.dto.metric.MetricLabelValueDto;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;

public interface MetricsMapper {
    MetricFamily mapFromSeries(final MetricFamilyPojo family,
                               final Collection<MetricSeriesDto> series,
                               final List<MetricLabelValueDto> labelValues);
}
