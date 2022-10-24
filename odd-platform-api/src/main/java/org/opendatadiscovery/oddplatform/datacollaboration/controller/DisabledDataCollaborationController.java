package org.opendatadiscovery.oddplatform.datacollaboration.controller;

import org.opendatadiscovery.oddplatform.api.contract.api.DataCollaborationApi;
import org.opendatadiscovery.oddplatform.api.contract.model.SlackChannelList;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@ConditionalOnDataCollaboration(enabled = false)
public class DisabledDataCollaborationController implements DataCollaborationApi {
    @Override
    public Mono<ResponseEntity<SlackChannelList>> getSlackChannels(final ServerWebExchange exchange) {
        return Mono.just(ResponseEntity.status(HttpStatus.I_AM_A_TEAPOT).build());
    }
}