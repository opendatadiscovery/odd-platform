package org.opendatadiscovery.oddplatform.controller;

import org.opendatadiscovery.oddplatform.api.contract.api.FeatureApi;
import org.opendatadiscovery.oddplatform.api.contract.model.FeatureList;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
public class FeatureController implements FeatureApi {
    @Override
    public Mono<ResponseEntity<FeatureList>> getActiveFeatures(final ServerWebExchange exchange) {
        return FeatureApi.super.getActiveFeatures(exchange);
    }
}
