package org.opendatadiscovery.oddplatform.service.ingestion.metric.extractors.internal;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionMetricLabelsDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionMetricPointDto;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesDto;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesValueType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricType;
import org.opendatadiscovery.oddplatform.mapper.ingestion.IngestionMetricsMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "metrics.storage", havingValue = "INTERNAL_POSTGRES", matchIfMissing = true)
public class CounterMetricsSeriesExtractor extends AbstractMetricSeriesExtractor implements MetricSeriesExtractor {

    public CounterMetricsSeriesExtractor(final IngestionMetricsMapper mapper) {
        super(mapper);
    }

    @Override
    public boolean canExtract(final MetricType metricType) {
        return metricType == MetricType.COUNTER;
    }

    @Override
    public List<MetricSeriesDto> extractSeries(final IngestionMetricPointDto point,
                                               final MetricEntityPojo metricEntityPojo,
                                               final MetricFamilyPojo metricFamilyPojo,
                                               final IngestionMetricLabelsDto allLabelsDto,
                                               final LocalDateTime ingestedDateTime) {
        if (point.metricPoint().getCounterValue() == null || point.metricPoint().getCounterValue().getTotal() == null) {
            throw new IllegalArgumentException("Counter value is null");
        }
        final List<MetricSeriesDto> result = new ArrayList<>();
        result.add(createTotalSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, ingestedDateTime));
        result.add(createCreatedSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, ingestedDateTime));
        return result;
    }

    private MetricSeriesDto createTotalSeries(final IngestionMetricPointDto point,
                                              final MetricEntityPojo metricEntityPojo,
                                              final MetricFamilyPojo metricFamilyPojo,
                                              final IngestionMetricLabelsDto allLabelsDto,
                                              final LocalDateTime defaultDateTime) {
        final double value = point.metricPoint().getCounterValue().getTotal().doubleValue();
        return createSimpleSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, defaultDateTime,
            MetricSeriesValueType.VALUE, value);
    }

    private MetricSeriesDto createCreatedSeries(final IngestionMetricPointDto point,
                                                final MetricEntityPojo metricEntityPojo,
                                                final MetricFamilyPojo metricFamilyPojo,
                                                final IngestionMetricLabelsDto allLabelsDto,
                                                final LocalDateTime defaultDateTime) {
        final Double value = point.metricPoint().getCounterValue().getCreated() != null
            ? point.metricPoint().getCounterValue().getCreated().doubleValue() : null;
        return createSimpleSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, defaultDateTime,
            MetricSeriesValueType.CREATED, value);
    }
}
