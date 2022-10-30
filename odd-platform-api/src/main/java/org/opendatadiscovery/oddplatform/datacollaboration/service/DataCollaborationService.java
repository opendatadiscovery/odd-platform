package org.opendatadiscovery.oddplatform.datacollaboration.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Message;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannelList;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageRequest;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import reactor.core.publisher.Mono;

public interface DataCollaborationService {
    Mono<MessageChannelList> getSlackChannels();

    Mono<MessageChannelList> getSlackChannels(final String channelNameStartsWith);

    Mono<Message> createAndSendMessage(final MessageRequest message, final MessageProviderDto messageProvider);

    Mono<Void> enqueueMessageEvent(final String messageEvent, final MessageProviderDto messageProvider);
}
