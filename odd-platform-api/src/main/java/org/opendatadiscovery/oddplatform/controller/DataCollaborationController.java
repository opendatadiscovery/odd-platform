package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DataCollaborationApi;
import org.opendatadiscovery.oddplatform.api.contract.model.SlackChannelList;
import org.opendatadiscovery.oddplatform.service.feature.FeatureResolver;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class DataCollaborationController implements DataCollaborationApi {
    private final FeatureResolver featureResolver;

    @Override
    public Mono<ResponseEntity<SlackChannelList>> getSlackChannels(final ServerWebExchange exchange) {
        return DataCollaborationApi.super.getSlackChannels(exchange);
    }
}
