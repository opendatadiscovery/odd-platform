package org.opendatadiscovery.oddplatform.service.metric.extractors;

import io.opentelemetry.sdk.common.InstrumentationLibraryInfo;
import io.opentelemetry.sdk.metrics.data.DoubleGaugeData;
import io.opentelemetry.sdk.metrics.data.DoublePointData;
import io.opentelemetry.sdk.metrics.data.LongGaugeData;
import io.opentelemetry.sdk.metrics.data.LongPointData;
import io.opentelemetry.sdk.metrics.data.MetricData;
import io.opentelemetry.sdk.metrics.data.PointData;
import io.opentelemetry.sdk.resources.Resource;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.opendatadiscovery.oddplatform.dto.IngestionDataStructure;
import org.opendatadiscovery.oddplatform.service.metric.dto.MetricDataTriplet;
import org.opendatadiscovery.oddplatform.utils.Pair;

public interface MetricExtractor {
    Stream<MetricData> extract(final IngestionDataStructure dataStructure);

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
            return MetricData.createDoubleGauge(
                Resource.getDefault(),
                InstrumentationLibraryInfo.empty(),
                metricDataTriplet.getName(),
                metricDataTriplet.getDescription(),
                metricDataTriplet.getUnit(),
                DoubleGaugeData.create((List<DoublePointData>) points)
            );
        }

        return MetricData.createLongGauge(
            Resource.getDefault(),
            InstrumentationLibraryInfo.empty(),
            metricDataTriplet.getName(),
            metricDataTriplet.getDescription(),
            metricDataTriplet.getUnit(),
            LongGaugeData.create((List<LongPointData>) points)
        );
    }
}
