package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.IntegrationApi;
import org.opendatadiscovery.oddplatform.api.contract.model.Integration;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationPreviewList;
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
    public Mono<ResponseEntity<Integration>> getIntegration(final String integrationId,
                                                            final ServerWebExchange exchange) {
        return integrationService.get(integrationId).map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<IntegrationPreviewList>> getIntegrationPreviews(final ServerWebExchange exchange) {
        return integrationService.listPreviews().map(ResponseEntity::ok);
    }
}
