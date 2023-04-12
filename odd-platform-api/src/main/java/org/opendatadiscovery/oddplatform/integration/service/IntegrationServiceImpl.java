package org.opendatadiscovery.oddplatform.integration.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.Integration;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationPreviewList;
import org.opendatadiscovery.oddplatform.integration.IntegrationRegistry;
import org.opendatadiscovery.oddplatform.integration.mapper.IntegrationMapper;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class IntegrationServiceImpl implements IntegrationService {
    private final IntegrationRegistry integrationRegistry;
    private final IntegrationMapper integrationMapper;

    @Override
    public Mono<Integration> get(final String id) {
        return integrationRegistry.get(id).map(integrationMapper::map);
    }

    @Override
    public Mono<IntegrationPreviewList> listPreviews() {
        return integrationRegistry.list().collectList().map(integrationMapper::map);
    }
}
