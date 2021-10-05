package com.provectus.oddplatform.service.metric;

import com.provectus.oddplatform.dto.IngestionDataStructure;
import com.provectus.oddplatform.service.metric.extractors.MetricExtractor;
import io.opentelemetry.exporter.otlp.metrics.OtlpGrpcMetricExporter;
import io.opentelemetry.sdk.metrics.data.MetricData;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(value = "metrics.export.enabled", havingValue = "true")
public class MetricServiceImpl implements MetricService {
    private final OtlpGrpcMetricExporter otlpExporter;
    private final MetricExtractor metricExtractor;

    @Override
    public Mono<IngestionDataStructure> exportMetrics(final IngestionDataStructure dataStructure) {
        final Stream<MetricData> datasetMetrics = metricExtractor.extractDatasetMetrics(dataStructure.getAllEntities());
        final Stream<MetricData> taskRunMetrics = metricExtractor.extractTaskRunMetrics(dataStructure.getTaskRuns());
        final Stream<MetricData> datasetFieldMetrics =
            metricExtractor.extractDatasetFieldMetrics(dataStructure.getAllEntities());

        final List<MetricData> metrics = Stream
            .of(datasetMetrics, taskRunMetrics, datasetFieldMetrics)
            .flatMap(identity())
            .collect(Collectors.toList());

        // TODO: rewrite to reactive
        otlpExporter.export(metrics).join(10, TimeUnit.SECONDS);

        return Mono.just(dataStructure);
    }
}
