package org.opendatadiscovery.oddplatform.integration.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationList;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationOverview;
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
    public Mono<IntegrationOverview> get(final String id) {
        return integrationRegistry.get(id).map(integrationMapper::map);
    }

    @Override
    public Mono<IntegrationList> list() {
        return integrationRegistry.list().collectList().map(integrationMapper::map);
    }
}
