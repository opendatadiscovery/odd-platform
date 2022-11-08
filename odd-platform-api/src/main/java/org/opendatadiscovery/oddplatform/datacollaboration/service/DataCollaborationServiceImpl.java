package org.opendatadiscovery.oddplatform.datacollaboration.service;

import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.api.contract.model.Message;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannelList;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageState;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.mapper.DataCollaborationMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.repository.MessageRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;

@Service
@ConditionalOnDataCollaboration
@Slf4j
public class DataCollaborationServiceImpl implements DataCollaborationService {
    private final MessageRepository messageRepository;
    private final DataCollaborationMapper dataCollaborationMapper;

    // TODO: to separate beans would be great
    private final Map<MessageProviderDto, MessageProviderClient> messageProviderClients;
    private final Map<MessageProviderDto, MessageProviderEventHandler> messageProviderEventHandlers;

    public DataCollaborationServiceImpl(final MessageRepository messageRepository,
                                        final DataCollaborationMapper dataCollaborationMapper,
                                        final List<MessageProviderClient> messageProviderClients,
                                        final List<MessageProviderEventHandler> messageProviderEventHandlers) {
        this.messageRepository = messageRepository;
        this.dataCollaborationMapper = dataCollaborationMapper;

        this.messageProviderClients = messageProviderClients.stream()
            .collect(toMap(MessageProviderClient::getProvider, identity()));

        this.messageProviderEventHandlers = messageProviderEventHandlers.stream()
            .collect(toMap(MessageProviderEventHandler::getProvider, identity()));
    }

    @Override
    public Mono<MessageChannelList> getChannels(final MessageProviderDto messageProvider) {
        final MessageProviderClient messageProviderClient = messageProviderClients.get(messageProvider);
        if (messageProviderClient == null) {
            throw new IllegalStateException(
                "No message provider client found for %s".formatted(messageProvider.toString()));
        }

        return messageProviderClient.getChannels()
            .collectList()
            .map(dataCollaborationMapper::mapSlackChannelList);
    }

    @Override
    // TODO: find a way to get Slack channels that have bot installed
    public Mono<MessageChannelList> getChannels(final String nameLike, final MessageProviderDto messageProvider) {
        final MessageProviderClient messageProviderClient = messageProviderClients.get(messageProvider);
        if (messageProviderClient == null) {
            throw new IllegalStateException(
                "No message provider client found for %s".formatted(messageProvider.toString()));
        }

        return messageProviderClient.getChannels(nameLike)
            .collectList()
            .map(dataCollaborationMapper::mapSlackChannelList);
    }

    @Override
    public Mono<Message> createAndSendMessage(final MessageRequest messageRequest,
                                              final MessageProviderDto messageProvider) {
        final MessageProviderClient messageProviderClient = messageProviderClients.get(messageProvider);
        if (messageProviderClient == null) {
            throw new IllegalStateException(
                "No message provider client found for %s".formatted(messageProvider.toString()));
        }

        return messageProviderClient.getChannelById(messageRequest.getChannelId())
            .flatMap(channel -> {
                final MessagePojo messagePojo = new MessagePojo()
                    .setDataEntityId(messageRequest.getDataEntityId())
                    .setState(MessageStateDto.PENDING_SEND.toString())
                    .setProvider(messageProvider.toString())
                    .setChannelId(channel.id())
                    .setChannelName(channel.name())
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
        final MessageProviderEventHandler messageProviderEventHandler =
            messageProviderEventHandlers.get(messageEvent.provider());

        if (messageProviderEventHandler == null) {
            throw new IllegalStateException(
                "No message provider event handler found for %s".formatted(messageEvent.provider()));
        }

        return messageProviderEventHandler.handleEvent(messageEvent);
    }
}
