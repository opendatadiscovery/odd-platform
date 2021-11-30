package org.opendatadiscovery.oddplatform.config.properties;

import java.net.URI;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("metrics.export")
@Data
public class MetricExporterProperties {
    private URI otlpEndpoint;
}
