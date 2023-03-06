package org.opendatadiscovery.oddplatform.service.ingestion.metric.extractors.internal;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.collections4.CollectionUtils;
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
@ConditionalOnProperty(name = "metrics.storage", havingValue = "internal", matchIfMissing = true)
public class HistogramMetricSeriesExtractor extends AbstractMetricSeriesExtractor implements MetricSeriesExtractor {

    public HistogramMetricSeriesExtractor(final IngestionMetricsMapper mapper) {
        super(mapper);
    }

    @Override
    public boolean canExtract(final MetricType metricType) {
        return metricType == MetricType.HISTOGRAM || metricType == MetricType.GAUGE_HISTOGRAM;
    }

    @Override
    public List<MetricSeriesDto> extractSeries(final IngestionMetricPointDto point,
                                               final MetricEntityPojo metricEntityPojo,
                                               final MetricFamilyPojo metricFamilyPojo,
                                               final IngestionMetricLabelsDto allLabelsDto) {
        if (point.metricPoint().getHistogramValue() == null) {
            throw new IllegalArgumentException("Histogram metric point must have histogram value");
        }
        if (CollectionUtils.isEmpty(point.metricPoint().getHistogramValue().getBuckets())) {
            throw new IllegalArgumentException("Histogram metric point must have at least one bucket");
        }
        final List<MetricSeriesDto> result = new ArrayList<>();
        final LocalDateTime defaultDateTime = OffsetDateTime.now(ZoneOffset.UTC).toLocalDateTime();
        if (point.metricPoint().getHistogramValue().getSum() != null) {
            result.add(createSumSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, defaultDateTime));
        }
        if (point.metricPoint().getHistogramValue().getCount() != null) {
            result.add(createCountSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, defaultDateTime));
        }
        if (point.metricPoint().getHistogramValue().getBuckets() != null) {
            result.add(createBucketSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, defaultDateTime));
        }
        if (point.metricPoint().getHistogramValue().getCreated() != null) {
            result.add(createCreatedSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, defaultDateTime));
        }
        return result;
    }

    private MetricSeriesDto createSumSeries(final IngestionMetricPointDto point,
                                            final MetricEntityPojo metricEntityPojo,
                                            final MetricFamilyPojo metricFamilyPojo,
                                            final IngestionMetricLabelsDto allLabelsDto,
                                            final LocalDateTime defaultDateTime) {
        final double value = point.metricPoint().getHistogramValue().getSum().doubleValue();
        return createSimpleSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, defaultDateTime,
            MetricSeriesValueType.SUM, value);
    }

    private MetricSeriesDto createCountSeries(final IngestionMetricPointDto point,
                                              final MetricEntityPojo metricEntityPojo,
                                              final MetricFamilyPojo metricFamilyPojo,
                                              final IngestionMetricLabelsDto allLabelsDto,
                                              final LocalDateTime defaultDateTime) {
        final double value = point.metricPoint().getHistogramValue().getCount().doubleValue();
        return createSimpleSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, defaultDateTime,
            MetricSeriesValueType.COUNT, value);
    }

    private MetricSeriesDto createCreatedSeries(final IngestionMetricPointDto point,
                                                final MetricEntityPojo metricEntityPojo,
                                                final MetricFamilyPojo metricFamilyPojo,
                                                final IngestionMetricLabelsDto allLabelsDto,
                                                final LocalDateTime defaultDateTime) {
        final double value = point.metricPoint().getHistogramValue().getCreated().doubleValue();
        return createSimpleSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, defaultDateTime,
            MetricSeriesValueType.CREATED, value);
    }
}
