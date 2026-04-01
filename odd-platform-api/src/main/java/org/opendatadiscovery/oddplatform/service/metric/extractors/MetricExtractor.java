package org.opendatadiscovery.oddplatform.service.metric.extractors;

import io.opentelemetry.sdk.common.InstrumentationScopeInfo;
import io.opentelemetry.sdk.metrics.data.DoublePointData;
import io.opentelemetry.sdk.metrics.data.LongPointData;
import io.opentelemetry.sdk.metrics.data.MetricData;
import io.opentelemetry.sdk.metrics.data.PointData;
import io.opentelemetry.sdk.metrics.internal.data.ImmutableGaugeData;
import io.opentelemetry.sdk.metrics.internal.data.ImmutableMetricData;
import io.opentelemetry.sdk.resources.Resource;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.service.metric.dto.MetricDataTriplet;
import org.opendatadiscovery.oddplatform.utils.Pair;

public interface MetricExtractor {
    Stream<MetricData> extract(final IngestionRequest dataStructure);

    default Stream<MetricData> gaugeStream(final Stream<Pair<MetricDataTriplet, ? extends PointData>> metricStream) {
        return metricStream
            .filter(p -> p.getRight() != null)
            .collect(Collectors.groupingBy(Pair::getLeft))
            .entrySet()
            .stream()
            .map(e -> Pair.of(e.getKey(), e.getValue().stream().map(Pair::getRight).collect(Collectors.toList())))
            .map(p -> gauge(p.getLeft(), p.getRight()));
    }

    @SuppressWarnings("unchecked")
    default MetricData gauge(final MetricDataTriplet metricDataTriplet, final List<? extends PointData> points) {
        if (metricDataTriplet.equals(MetricDataTriplet.DF_AVG_LENGTH)) {
            return ImmutableMetricData.createDoubleGauge(
                Resource.getDefault(),
                InstrumentationScopeInfo.empty(),
                metricDataTriplet.getName(),
                metricDataTriplet.getDescription(),
                metricDataTriplet.getUnit(),
                ImmutableGaugeData.create((List<DoublePointData>) points)
            );
        }

        return ImmutableMetricData.createLongGauge(
            Resource.getDefault(),
            InstrumentationScopeInfo.empty(),
            metricDataTriplet.getName(),
            metricDataTriplet.getDescription(),
            metricDataTriplet.getUnit(),
            ImmutableGaugeData.create((List<LongPointData>) points)
        );
    }
}
