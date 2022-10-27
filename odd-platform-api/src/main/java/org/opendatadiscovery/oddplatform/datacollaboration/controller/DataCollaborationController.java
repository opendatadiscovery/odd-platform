package org.opendatadiscovery.oddplatform.datacollaboration.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DataCollaborationApi;
import org.opendatadiscovery.oddplatform.api.contract.model.Message;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannelList;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageRequest;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.service.DataCollaborationService;
import org.springframework.http.HttpStatus;
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
    // TODO: handle parameter
    public Mono<ResponseEntity<MessageChannelList>> getSlackChannels(final String channelName,
                                                                     final ServerWebExchange exchange) {
        return dataCollaborationService
            .getSlackChannels()
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Message>> postMessageInSlack(final Mono<MessageRequest> messageRequest,
                                                            final ServerWebExchange exchange) {
        return messageRequest
            .flatMap(dataCollaborationService::createMessage)
            .map(message -> ResponseEntity.status(HttpStatus.ACCEPTED).body(message));
    }
}
