package org.opendatadiscovery.oddplatform.integration;

import org.opendatadiscovery.oddplatform.integration.dto.IntegrationOverviewDto;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationPreviewDto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface IntegrationRegistry {
    Mono<IntegrationOverviewDto> get(final String id);

    Flux<IntegrationPreviewDto> list();
}
