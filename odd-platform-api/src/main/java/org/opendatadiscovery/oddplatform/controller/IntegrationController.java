package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.IntegrationApi;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationList;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationOverview;
import org.opendatadiscovery.oddplatform.integration.service.IntegrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class IntegrationController implements IntegrationApi {
    private final IntegrationService integrationService;

    @Override
    public Mono<ResponseEntity<IntegrationList>> getIntegrations(final ServerWebExchange exchange) {
        return integrationService.list().map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<IntegrationOverview>> getIntegration(final String integrationId,
                                                                    final ServerWebExchange exchange) {
        // TODO: 200 when empty?
        return integrationService.get(integrationId).map(ResponseEntity::ok);
    }
}
