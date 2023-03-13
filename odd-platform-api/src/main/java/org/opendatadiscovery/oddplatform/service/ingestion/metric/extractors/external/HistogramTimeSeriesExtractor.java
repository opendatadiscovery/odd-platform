package org.opendatadiscovery.oddplatform.service.ingestion.metric.extractors.external;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Label;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricPoint;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricType;
import org.opendatadiscovery.oddplatform.mapper.ingestion.IngestionMetricsMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.opendatadiscovery.oddplatform.proto.TimeSeries;
import org.opendatadiscovery.oddplatform.utils.MetricUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesValueType.BUCKET;
import static org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesValueType.COUNT;
import static org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesValueType.CREATED;
import static org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesValueType.SUM;
import static org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel.BUCKET_UPPER_BOUND;
import static org.opendatadiscovery.oddplatform.utils.MetricUtils.generateMetricSeriesName;

@Component
@ConditionalOnProperty(name = "metrics.storage", havingValue = "PROMETHEUS")
public class HistogramTimeSeriesExtractor extends AbstractTimeSeriesExtractor implements TimeSeriesExtractor {
    public HistogramTimeSeriesExtractor(final IngestionMetricsMapper mapper,
                                        @Value("${odd.tenant-id}") final String tenantId) {
        super(mapper, tenantId);
    }

    @Override
    public boolean canExtract(final MetricType metricType) {
        return metricType == MetricType.HISTOGRAM || metricType == MetricType.GAUGE_HISTOGRAM;
    }

    @Override
    public List<TimeSeries> extractTimeSeries(final String oddrn,
                                              final MetricFamilyPojo metricFamilyPojo,
                                              final MetricPoint metricPoint,
                                              final List<Label> labels,
                                              final LocalDateTime ingestedDateTime) {
        if (metricPoint.getHistogramValue() == null) {
            throw new IllegalArgumentException("Histogram metric point must have histogram value");
        }
        if (CollectionUtils.isEmpty(metricPoint.getHistogramValue().getBuckets())) {
            throw new IllegalArgumentException("Histogram metric point must have at least one bucket");
        }
        final List<TimeSeries> result = new ArrayList<>();
        final long timestamp = getMetricPointTimestamp(metricPoint.getTimestamp(), ingestedDateTime);
        result.addAll(createBucketSeries(oddrn, metricFamilyPojo, metricPoint, labels, timestamp));
        result.add(createSumSeries(oddrn, metricFamilyPojo, metricPoint, labels, timestamp));
        result.add(createCountSeries(oddrn, metricFamilyPojo, metricPoint, labels, timestamp));
        result.add(createCreatedSeries(oddrn, metricFamilyPojo, metricPoint, labels, timestamp));
        return result;
    }

    private TimeSeries createCreatedSeries(final String oddrn,
                                           final MetricFamilyPojo metricFamilyPojo,
                                           final MetricPoint metricPoint,
                                           final List<Label> labels,
                                           final long timestamp) {
        final Double value = metricPoint.getHistogramValue().getCreated() != null
            ? metricPoint.getHistogramValue().getCreated().doubleValue() : Double.NaN;
        return createTimeSeries(oddrn, generateMetricSeriesName(metricFamilyPojo.getName(), CREATED),
            metricFamilyPojo.getId(), labels, value, timestamp);
    }

    private TimeSeries createCountSeries(final String oddrn,
                                         final MetricFamilyPojo metricFamilyPojo,
                                         final MetricPoint metricPoint, final List<Label> labels,
                                         final long timestamp) {
        final Double value = metricPoint.getHistogramValue().getCount() != null
            ? metricPoint.getHistogramValue().getCount().doubleValue() : Double.NaN;
        return createTimeSeries(oddrn, MetricUtils.generateMetricSeriesName(metricFamilyPojo.getName(), COUNT),
            metricFamilyPojo.getId(), labels, value, timestamp);
    }

    private TimeSeries createSumSeries(final String oddrn,
                                       final MetricFamilyPojo metricFamilyPojo,
                                       final MetricPoint metricPoint,
                                       final List<Label> labels, final long timestamp) {
        final Double value = metricPoint.getHistogramValue().getSum() != null
            ? metricPoint.getHistogramValue().getSum().doubleValue() : Double.NaN;
        return createTimeSeries(oddrn, MetricUtils.generateMetricSeriesName(metricFamilyPojo.getName(), SUM),
            metricFamilyPojo.getId(), labels, value, timestamp);
    }

    private List<TimeSeries> createBucketSeries(final String oddrn,
                                                final MetricFamilyPojo metricFamilyPojo,
                                                final MetricPoint metricPoint,
                                                final List<Label> labels,
                                                final long timestamp) {
        return metricPoint.getHistogramValue().getBuckets().stream().map(bucket -> {
            final var l = new ArrayList<>(labels);
            l.add(new Label().name(BUCKET_UPPER_BOUND.getLabelName()).value(bucket.getUpperBound().toString()));
            return createTimeSeries(oddrn, MetricUtils.generateMetricSeriesName(metricFamilyPojo.getName(), BUCKET),
                metricFamilyPojo.getId(), l, bucket.getCount().doubleValue(), timestamp);
        }).toList();
    }
}
