package org.opendatadiscovery.oddplatform.config;

import io.opentelemetry.exporter.otlp.metrics.OtlpGrpcMetricExporter;
import org.opendatadiscovery.oddplatform.config.properties.MetricExporterProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(value = "metrics.export.enabled", havingValue = "true")
public class MetricExporterConfiguration {
    @Bean
    public OtlpGrpcMetricExporter otlpGrpcMetricExporter(final MetricExporterProperties metricExporterProperties) {
        return OtlpGrpcMetricExporter.builder()
            .setEndpoint(metricExporterProperties.getOtlpEndpoint().toString())
            .build();
    }
}
