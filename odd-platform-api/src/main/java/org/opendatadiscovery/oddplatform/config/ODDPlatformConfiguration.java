package org.opendatadiscovery.oddplatform.config;

import org.opendatadiscovery.oddplatform.config.properties.MetricExporterProperties;
import org.opendatadiscovery.oddplatform.notification.NotificationsProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
@EnableWebFluxSecurity
@EnableConfigurationProperties({MetricExporterProperties.class, NotificationsProperties.class})
public class ODDPlatformConfiguration {
}
