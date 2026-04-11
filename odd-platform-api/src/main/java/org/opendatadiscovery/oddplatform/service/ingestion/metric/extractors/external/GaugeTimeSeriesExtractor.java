package org.opendatadiscovery.oddplatform.service.ingestion.metric.extractors.external;

import java.time.LocalDateTime;
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

@Component
@ConditionalOnProperty(name = "metrics.storage", havingValue = "PROMETHEUS")
public class GaugeTimeSeriesExtractor extends AbstractTimeSeriesExtractor implements TimeSeriesExtractor {
    public GaugeTimeSeriesExtractor(final IngestionMetricsMapper mapper,
                                    @Value("${odd.tenant-id}") final String tenantId) {
        super(mapper, tenantId);
    }

    @Override
    public boolean canExtract(final MetricType metricType) {
        return metricType == MetricType.GAUGE;
    }

    @Override
    public List<TimeSeries> extractTimeSeries(final String oddrn,
                                              final MetricFamilyPojo metricFamilyPojo,
                                              final MetricPoint metricPoint,
                                              final List<Label> labels,
                                              final LocalDateTime ingestedDateTime) {
        if (metricPoint.getGaugeValue() == null || metricPoint.getGaugeValue().getValue() == null) {
            throw new IllegalArgumentException("Gauge value is null");
        }
        final double value = metricPoint.getGaugeValue().getValue().doubleValue();
        final long timestamp = getMetricPointTimestamp(metricPoint.getTimestamp(), ingestedDateTime);
        final TimeSeries timeSeries =
            createTimeSeries(oddrn, metricFamilyPojo.getName(), metricFamilyPojo.getId(), labels, value, timestamp);
        return List.of(timeSeries);
    }
}
