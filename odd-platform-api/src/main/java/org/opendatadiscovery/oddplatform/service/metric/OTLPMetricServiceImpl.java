package org.opendatadiscovery.oddplatform.service.metric;

import io.opentelemetry.exporter.otlp.metrics.OtlpGrpcMetricExporter;
import io.opentelemetry.sdk.metrics.data.MetricData;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.service.metric.extractors.MetricExtractor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(value = "metrics.export.enabled", havingValue = "true")
public class OTLPMetricServiceImpl implements OTLPMetricService {
    private final OtlpGrpcMetricExporter otlpExporter;
    private final List<MetricExtractor> metricExtractors;

    @Override
    public Mono<IngestionRequest> exportMetrics(final IngestionRequest dataStructure) {
        final List<MetricData> metrics = metricExtractors.stream()
            .flatMap(me -> me.extract(dataStructure))
            .collect(Collectors.toList());

        otlpExporter.export(metrics).whenComplete(() -> log.debug("OTLP request attempt has been completed"));

        return Mono.just(dataStructure);
    }
}
