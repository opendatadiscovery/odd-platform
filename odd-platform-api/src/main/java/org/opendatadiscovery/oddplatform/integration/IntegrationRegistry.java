package org.opendatadiscovery.oddplatform.integration;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface IntegrationRegistry {
    Mono<IntegrationOverviewDto> get(final String id);

    Flux<IntegrationDto> list();
}
