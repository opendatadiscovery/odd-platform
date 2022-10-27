package org.opendatadiscovery.oddplatform.datacollaboration.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Message;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannelList;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageRequest;
import reactor.core.publisher.Mono;

public interface DataCollaborationService {
    Mono<MessageChannelList> getSlackChannels();

    Mono<Message> createMessage(final MessageRequest message);
}
