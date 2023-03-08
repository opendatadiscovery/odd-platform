package org.opendatadiscovery.oddplatform.service.ingestion.metric.extractors.internal;

import java.time.LocalDateTime;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionMetricLabelsDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionMetricPointDto;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricType;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;

public interface MetricSeriesExtractor {
    boolean canExtract(final MetricType metricType);

    List<MetricSeriesDto> extractSeries(final IngestionMetricPointDto point,
                                        final MetricEntityPojo metricEntityPojo,
                                        final MetricFamilyPojo metricFamilyPojo,
                                        final IngestionMetricLabelsDto allLabelsDto,
                                        final LocalDateTime ingestedTime);
}
