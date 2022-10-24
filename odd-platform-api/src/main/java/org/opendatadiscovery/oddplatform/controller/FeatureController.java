package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.FeatureApi;
import org.opendatadiscovery.oddplatform.api.contract.model.FeatureList;
import org.opendatadiscovery.oddplatform.service.feature.FeatureResolver;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class FeatureController implements FeatureApi {
    private final FeatureResolver featureResolver;

    @Override
    public Mono<ResponseEntity<FeatureList>> getActiveFeatures(final ServerWebExchange exchange) {
        return Mono.just(featureResolver.resolveActiveFeatures()).map(ResponseEntity::ok);
    }
}
