package org.opendatadiscovery.oddplatform.integration;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationOverviewDto;
import org.opendatadiscovery.oddplatform.integration.dto.IntegrationPreviewDto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class ResourceFilesIntegrationRegistry implements IntegrationRegistry {
    private final Map<String, IntegrationOverviewDto> registry;

    @Override
    public Mono<IntegrationOverviewDto> get(final String id) {
        return Mono.justOrEmpty(registry.get(id));
    }

    @Override
    public Flux<IntegrationPreviewDto> list() {
        return Flux.fromIterable(registry.values()).map(IntegrationOverviewDto::integration);
    }
}