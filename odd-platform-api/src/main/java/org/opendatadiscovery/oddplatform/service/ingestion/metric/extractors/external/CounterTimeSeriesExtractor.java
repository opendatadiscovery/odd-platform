package org.opendatadiscovery.oddplatform.service.ingestion.metric.extractors.external;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Label;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricPoint;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricType;
import org.opendatadiscovery.oddplatform.mapper.ingestion.IngestionMetricsMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.opendatadiscovery.oddplatform.proto.TimeSeries;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesValueType.CREATED;
import static org.opendatadiscovery.oddplatform.utils.MetricUtils.generateMetricSeriesName;

@Component
@ConditionalOnProperty(name = "metrics.storage", havingValue = "PROMETHEUS")
public class CounterTimeSeriesExtractor extends AbstractTimeSeriesExtractor implements TimeSeriesExtractor {
    public CounterTimeSeriesExtractor(final IngestionMetricsMapper mapper,
                                      @Value("${odd.tenant-id}") final String tenantId) {
        super(mapper, tenantId);
    }

    @Override
    public boolean canExtract(final MetricType metricType) {
        return metricType == MetricType.COUNTER;
    }

    @Override
    public List<TimeSeries> extractTimeSeries(final String oddrn,
                                              final MetricFamilyPojo metricFamilyPojo,
                                              final MetricPoint metricPoint,
                                              final List<Label> labels,
                                              final LocalDateTime ingestedDateTime) {
        if (metricPoint.getCounterValue() == null || metricPoint.getCounterValue().getTotal() == null) {
            throw new IllegalArgumentException("Counter value is null");
        }
        final long timestamp = getMetricPointTimestamp(metricPoint.getTimestamp(), ingestedDateTime);
        final List<TimeSeries> timeSeries = new ArrayList<>();
        timeSeries.add(createTotalSeries(oddrn, metricFamilyPojo, metricPoint, labels, timestamp));
        timeSeries.add(createCreatedSeries(oddrn, metricFamilyPojo, metricPoint, labels, timestamp));
        return timeSeries;
    }

    private TimeSeries createTotalSeries(final String oddrn,
                                         final MetricFamilyPojo metricFamilyPojo,
                                         final MetricPoint metricPoint,
                                         final List<Label> labels,
                                         final long timestamp) {
        final double value = metricPoint.getCounterValue().getTotal().doubleValue();
        return createTimeSeries(oddrn, metricFamilyPojo.getName(), metricFamilyPojo.getId(), labels, value,
            timestamp);
    }

    private TimeSeries createCreatedSeries(final String oddrn,
                                           final MetricFamilyPojo metricFamilyPojo,
                                           final MetricPoint metricPoint,
                                           final List<Label> labels,
                                           final long timestamp) {
        final Double value = metricPoint.getCounterValue().getCreated() != null
            ? metricPoint.getCounterValue().getCreated().doubleValue() : Double.NaN;
        return createTimeSeries(oddrn, generateMetricSeriesName(metricFamilyPojo.getName(), CREATED),
            metricFamilyPojo.getId(), labels, value,
            timestamp);
    }
}
