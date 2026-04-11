package org.opendatadiscovery.oddplatform.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerUIConfiguration {

    @Bean
    public GroupedOpenApi platformOpenApi() {
        final String[] paths = { "/api/**" };
        return GroupedOpenApi.builder().group("platform-api").pathsToMatch(paths)
            .build();
    }

    @Bean
    public GroupedOpenApi ingestionOpenApi() {
        final String[] paths = { "/ingestion/**" };
        return GroupedOpenApi.builder().group("ingestion-api").pathsToMatch(paths)
            .build();
    }
}
