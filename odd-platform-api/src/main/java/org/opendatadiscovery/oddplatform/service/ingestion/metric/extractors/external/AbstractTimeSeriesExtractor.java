package org.opendatadiscovery.oddplatform.service.ingestion.metric.extractors.external;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Label;
import org.opendatadiscovery.oddplatform.mapper.ingestion.IngestionMetricsMapper;
import org.opendatadiscovery.oddplatform.proto.Sample;
import org.opendatadiscovery.oddplatform.proto.TimeSeries;

import static org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel.METRIC_FAMILY_ID;
import static org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel.NAME;
import static org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel.ODDRN;
import static org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel.TENANT_ID;

@RequiredArgsConstructor
public abstract class AbstractTimeSeriesExtractor {
    protected final IngestionMetricsMapper mapper;
    protected final String tenantId;

    protected TimeSeries createTimeSeries(final String oddrn,
                                          final String metricName,
                                          final Integer metricFamilyId,
                                          final List<Label> labels,
                                          final Double value,
                                          final long timestamp) {
        final var protoLabels = mapper.mapToProtoLabels(labels);
        protoLabels.addAll(systemLabels(oddrn, metricName, metricFamilyId.toString()));
        return TimeSeries.newBuilder()
            .addSamples(createSample(timestamp, value))
            .addAllLabels(protoLabels)
            .build();
    }

    protected long getMetricPointTimestamp(final Integer epochSeconds, final LocalDateTime ingestedDateTime) {
        if (epochSeconds == null) {
            return ingestedDateTime.atOffset(ZoneOffset.UTC).toInstant().toEpochMilli();
        }
        return Instant.ofEpochSecond(epochSeconds).toEpochMilli();
    }

    private Sample createSample(final long timestamp,
                                final Double value) {
        return Sample.newBuilder()
            .setTimestamp(timestamp)
            .setValue(value)
            .build();
    }

    private List<org.opendatadiscovery.oddplatform.proto.Label> systemLabels(final String oddrn,
                                                                             final String metricName,
                                                                             final String metricFamilyId) {
        final List<org.opendatadiscovery.oddplatform.proto.Label> labels = new ArrayList<>();
        labels.add(mapper.mapToProtoLabel(new Label().name(NAME.getLabelName()).value(metricName)));
        labels.add(mapper.mapToProtoLabel(new Label().name(ODDRN.getLabelName()).value(oddrn)));
        labels.add(mapper.mapToProtoLabel(new Label().name(METRIC_FAMILY_ID.getLabelName()).value(metricFamilyId)));
        if (tenantId != null) {
            labels.add(mapper.mapToProtoLabel(new Label().name(TENANT_ID.getLabelName()).value(tenantId)));
        }
        return labels;
    }
}
