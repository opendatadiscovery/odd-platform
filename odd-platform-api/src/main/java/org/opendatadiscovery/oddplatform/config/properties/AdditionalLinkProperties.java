package org.opendatadiscovery.oddplatform.config.properties;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("odd")
public record AdditionalLinkProperties(List<Link> links) {
    public record Link(String title, String url) {
    }
}
