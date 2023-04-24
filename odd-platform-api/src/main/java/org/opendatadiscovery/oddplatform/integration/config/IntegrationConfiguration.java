package org.opendatadiscovery.oddplatform.integration.config;

import org.opendatadiscovery.oddplatform.integration.IntegrationRegistry;
import org.opendatadiscovery.oddplatform.integration.IntegrationRegistryFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IntegrationConfiguration {
    @Bean
    public IntegrationRegistry integrationRegistry() {
        return IntegrationRegistryFactory.createResourceFilesIntegrationRegistry();
    }
}
