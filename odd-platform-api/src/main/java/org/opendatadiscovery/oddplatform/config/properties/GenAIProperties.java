package org.opendatadiscovery.oddplatform.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("genai")
@Data
public class GenAIProperties {
    private boolean enabled;
    private String url;
    private int requestTimeout;
}
