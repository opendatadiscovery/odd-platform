package org.opendatadiscovery.oddplatform.datacollaboration.service;

import java.time.OffsetDateTime;
import java.util.UUID;
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
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.MessageMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.repository.MessageRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.utils.UUIDHelper;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static reactor.function.TupleUtils.function;

@Service
@ConditionalOnDataCollaboration
@Slf4j
@RequiredArgsConstructor
public class DataCollaborationServiceImpl implements DataCollaborationService {
    private final MessageRepository messageRepository;
    private final ReactiveDataEntityRepository dataEntityRepository;
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
    public Mono<Message> createAndSendMessage(final MessageRequest messageRequest,
                                              final MessageProviderDto messageProvider) {
        return dataEntityRepository.get(messageRequest.getDataEntityId())
            .flatMap(dataEntity -> !dataEntity.getHollow() ? Mono.just(dataEntity.getId()) : Mono.empty())
            .switchIfEmpty(Mono.error(new NotFoundException("Data entity", messageRequest.getDataEntityId())))
            .zipWith(messageProviderClientFactory
                .getOrFail(messageProvider)
                .getChannelById(messageRequest.getChannelId())
            )
            .flatMap(function((dataEntityId, channel) -> {
                final UUID messageUUID = UUIDHelper.generateUUIDv1();
                final OffsetDateTime createdAt = UUIDHelper.extractDateTimeFromUUID(messageUUID);

                final MessagePojo messagePojo = new MessagePojo()
                    .setUuid(messageUUID)
                    .setCreatedAt(createdAt)
                    .setDataEntityId(messageRequest.getDataEntityId())
                    .setState(MessageStateDto.PENDING_SEND.getCode())
                    .setProvider(messageProvider.toString())
                    .setProviderChannelId(channel.id())
                    .setText(messageRequest.getText());

                return messageRepository.create(messagePojo)
                    // TODO: mapper
                    .map(pojo -> new Message()
                        .id(messageUUID)
                        .text(pojo.getText())
                        .createdAt(pojo.getCreatedAt())
                        .state(MessageState.PENDING_SEND)
                    );
            }));
    }

    @Override
    public Mono<Void> enqueueMessageEvent(final MessageEventDto messageEvent) {
        return messageProviderEventHandlerFactory
            .getOrFail(messageEvent.provider())
            .enqueueEvent(messageEvent);
    }

    @Override
    public Mono<String> resolveMessageUrl(final UUID messageId) {
        return messageRepository.getMessageProviderIdentity(messageId)
            .flatMap(messageIdentity -> messageProviderClientFactory
                .getOrFail(messageIdentity.messageProvider())
                .resolveMessageUrl(messageIdentity.providerMessageChannel(), messageIdentity.providerMessageId()));
    }
}
