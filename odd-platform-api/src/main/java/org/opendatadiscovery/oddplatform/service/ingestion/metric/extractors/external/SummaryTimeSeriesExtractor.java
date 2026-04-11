package org.opendatadiscovery.oddplatform.service.ingestion.metric.extractors.external;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Label;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricPoint;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricType;
import org.opendatadiscovery.oddplatform.mapper.ingestion.IngestionMetricsMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.opendatadiscovery.oddplatform.proto.TimeSeries;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesValueType.COUNT;
import static org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesValueType.CREATED;
import static org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesValueType.QUANTILE;
import static org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesValueType.SUM;
import static org.opendatadiscovery.oddplatform.utils.MetricUtils.generateMetricSeriesName;

@Component
@ConditionalOnProperty(name = "metrics.storage", havingValue = "PROMETHEUS")
public class SummaryTimeSeriesExtractor extends AbstractTimeSeriesExtractor implements TimeSeriesExtractor {
    public SummaryTimeSeriesExtractor(final IngestionMetricsMapper mapper,
                                      final @Value("${odd.tenant-id}") String tenantId) {
        super(mapper, tenantId);
    }

    @Override
    public boolean canExtract(final MetricType metricType) {
        return metricType == MetricType.SUMMARY;
    }

    @Override
    public List<TimeSeries> extractTimeSeries(final String oddrn,
                                              final MetricFamilyPojo metricFamilyPojo,
                                              final MetricPoint metricPoint,
                                              final List<Label> labels,
                                              final LocalDateTime ingestedDateTime) {
        if (metricPoint.getSummaryValue() == null) {
            throw new IllegalArgumentException("Summary metric point must have summary value");
        }
        if (CollectionUtils.isEmpty(metricPoint.getSummaryValue().getQuantile())) {
            throw new IllegalArgumentException("Summary metric point must have at least one quantile");
        }
        final List<TimeSeries> result = new ArrayList<>();
        final long timestamp = getMetricPointTimestamp(metricPoint.getTimestamp(), ingestedDateTime);
        result.addAll(createQuantileSeries(oddrn, metricFamilyPojo, metricPoint, labels, timestamp));
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
        final Double value = metricPoint.getSummaryValue().getCreated() != null
            ? metricPoint.getSummaryValue().getCreated().doubleValue() : Double.NaN;
        return createTimeSeries(oddrn, generateMetricSeriesName(metricFamilyPojo.getName(), CREATED),
            metricFamilyPojo.getId(), labels, value, timestamp);
    }

    private TimeSeries createCountSeries(final String oddrn,
                                         final MetricFamilyPojo metricFamilyPojo,
                                         final MetricPoint metricPoint,
                                         final List<Label> labels,
                                         final long timestamp) {
        final Double value = metricPoint.getSummaryValue().getCount() != null
            ? metricPoint.getSummaryValue().getCount().doubleValue() : Double.NaN;
        return createTimeSeries(oddrn, generateMetricSeriesName(metricFamilyPojo.getName(), COUNT),
            metricFamilyPojo.getId(), labels, value, timestamp);
    }

    private TimeSeries createSumSeries(final String oddrn,
                                       final MetricFamilyPojo metricFamilyPojo,
                                       final MetricPoint metricPoint,
                                       final List<Label> labels,
                                       final long timestamp) {
        final Double value = metricPoint.getSummaryValue().getSum() != null
            ? metricPoint.getSummaryValue().getSum().doubleValue() : Double.NaN;
        return createTimeSeries(oddrn, generateMetricSeriesName(metricFamilyPojo.getName(), SUM),
            metricFamilyPojo.getId(), labels, value, timestamp);
    }

    private List<TimeSeries> createQuantileSeries(final String oddrn,
                                                  final MetricFamilyPojo metricFamilyPojo,
                                                  final MetricPoint metricPoint,
                                                  final List<Label> labels,
                                                  final long timestamp) {
        return metricPoint.getSummaryValue().getQuantile().stream().map(quantile -> {
            final var l = new ArrayList<>(labels);
            l.add(new Label().name(SystemMetricLabel.QUANTILE.getLabelName()).value(quantile.getQuantile().toString()));
            return createTimeSeries(oddrn, generateMetricSeriesName(metricFamilyPojo.getName(), QUANTILE),
                metricFamilyPojo.getId(), l, quantile.getValue().doubleValue(), timestamp);
        }).toList();
    }
}
