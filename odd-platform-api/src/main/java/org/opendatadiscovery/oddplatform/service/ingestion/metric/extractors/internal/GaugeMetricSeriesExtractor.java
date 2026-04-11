package org.opendatadiscovery.oddplatform.service.ingestion.metric.extractors.internal;

import java.time.LocalDateTime;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionMetricLabelsDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionMetricPointDto;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesDto;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesValueType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricType;
import org.opendatadiscovery.oddplatform.mapper.ingestion.IngestionMetricsMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "metrics.storage", havingValue = "INTERNAL_POSTGRES", matchIfMissing = true)
public class GaugeMetricSeriesExtractor extends AbstractMetricSeriesExtractor implements MetricSeriesExtractor {

    public GaugeMetricSeriesExtractor(final IngestionMetricsMapper mapper) {
        super(mapper);
    }

    @Override
    public boolean canExtract(final MetricType metricType) {
        return metricType == MetricType.GAUGE;
    }

    @Override
    public List<MetricSeriesDto> extractSeries(final IngestionMetricPointDto point,
                                               final MetricEntityPojo metricEntityPojo,
                                               final MetricFamilyPojo metricFamilyPojo,
                                               final IngestionMetricLabelsDto allLabelsDto,
                                               final LocalDateTime ingestedDateTime) {
        if (point.metricPoint().getGaugeValue() == null || point.metricPoint().getGaugeValue().getValue() == null) {
            throw new IllegalArgumentException("Gauge value is null");
        }
        final double value = point.metricPoint().getGaugeValue().getValue().doubleValue();
        final MetricSeriesDto series = createSimpleSeries(point, metricEntityPojo, metricFamilyPojo,
            allLabelsDto, ingestedDateTime, MetricSeriesValueType.VALUE, value);
        return List.of(series);
    }
}
