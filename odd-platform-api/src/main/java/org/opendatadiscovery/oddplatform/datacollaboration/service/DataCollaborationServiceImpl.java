package org.opendatadiscovery.oddplatform.datacollaboration.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.api.contract.model.Message;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannelList;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageState;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageStateDto;
import org.opendatadiscovery.oddplatform.mapper.MessageMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.repository.MessageRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@ConditionalOnDataCollaboration
@Slf4j
@RequiredArgsConstructor
public class DataCollaborationServiceImpl implements DataCollaborationService {
    private final MessageRepository messageRepository;
    private final MessageMapper messageMapper;
    private final MessageProviderClientFactory messageProviderClientFactory;
    private final MessageProviderEventHandlerFactory messageProviderEventHandlerFactory;

    @Override
    public Mono<MessageChannelList> getChannels(final MessageProviderDto messageProvider) {
        return messageProviderClientFactory.getOrFail(messageProvider)
            .getChannels()
            .collectList()
            .map(messageMapper::mapSlackChannelList);
    }

    @Override
    public Mono<MessageChannelList> getChannels(final String nameLike, final MessageProviderDto messageProvider) {
        return messageProviderClientFactory.getOrFail(messageProvider)
            .getChannels(nameLike)
            .collectList()
            .map(messageMapper::mapSlackChannelList);
    }

    @Override
    // TODO: partition messages by created_at
    public Mono<Message> createAndSendMessage(final MessageRequest messageRequest,
                                              final MessageProviderDto messageProvider) {
        return messageProviderClientFactory.getOrFail(messageProvider)
            .getChannelById(messageRequest.getChannelId())
            .flatMap(channel -> {
                final MessagePojo messagePojo = new MessagePojo()
                    .setDataEntityId(messageRequest.getDataEntityId())
                    .setState(MessageStateDto.PENDING_SEND.toString())
                    .setProvider(messageProvider.toString())
                    .setProviderChannelId(channel.id())
                    .setText(messageRequest.getText());

                return messageRepository.create(messagePojo)
                    // TODO: mapper
                    .map(pojo -> new Message()
                        .id(pojo.getId())
                        .text(pojo.getText())
                        .createdAt(pojo.getCreatedAt())
                        .state(MessageState.fromValue(pojo.getState()))
                    );
            });
    }

    @Override
    public Mono<Void> enqueueMessageEvent(final MessageEventDto messageEvent) {
        return messageProviderEventHandlerFactory
            .getOrFail(messageEvent.provider())
            .enqueueEvent(messageEvent);
    }
}
