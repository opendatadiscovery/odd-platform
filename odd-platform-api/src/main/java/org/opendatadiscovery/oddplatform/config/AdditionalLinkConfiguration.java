package org.opendatadiscovery.oddplatform.config;

import org.opendatadiscovery.oddplatform.config.properties.AdditionalLinkProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(AdditionalLinkProperties.class)
public class AdditionalLinkConfiguration {
}
