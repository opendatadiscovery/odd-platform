package org.opendatadiscovery.oddplatform.config;

import org.opendatadiscovery.oddplatform.config.properties.MetricExporterProperties;
import org.opendatadiscovery.oddplatform.datacollaboration.config.DataCollaborationProperties;
import org.opendatadiscovery.oddplatform.housekeeping.config.HousekeepingTTLProperties;
import org.opendatadiscovery.oddplatform.notification.config.NotificationsProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
@EnableAspectJAutoProxy
@EnableConfigurationProperties({
    MetricExporterProperties.class,
    // TODO: doesn't it work in the nested configurations??
    NotificationsProperties.class,
    HousekeepingTTLProperties.class
})
public class ODDPlatformConfiguration {
}
