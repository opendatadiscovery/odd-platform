package org.opendatadiscovery.oddplatform.datacollaboration.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DataCollaborationApi;
import org.opendatadiscovery.oddplatform.api.contract.model.SlackChannelList;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.service.DataCollaborationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
@RestController
@ConditionalOnDataCollaboration
public class DataCollaborationController implements DataCollaborationApi {
    private final DataCollaborationService dataCollaborationService;

    @Override
    public Mono<ResponseEntity<SlackChannelList>> getSlackChannels(final ServerWebExchange exchange) {
        return dataCollaborationService
            .getSlackChannels()
            .map(ResponseEntity::ok);
    }
}
