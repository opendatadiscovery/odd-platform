package org.opendatadiscovery.oddplatform.datacollaboration.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Message;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannelList;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageRequest;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import reactor.core.publisher.Mono;

public interface DataCollaborationService {
    Mono<MessageChannelList> getChannels(final MessageProviderDto messageProvider);

    Mono<MessageChannelList> getChannels(final String nameLike, final MessageProviderDto messageProvider);

    Mono<Message> createAndSendMessage(final MessageRequest message, final MessageProviderDto messageProvider);

    Mono<Void> enqueueMessageEvent(final MessageEventDto messageEvent);

    Mono<String> resolveMessageUrl(final long messageId);
}