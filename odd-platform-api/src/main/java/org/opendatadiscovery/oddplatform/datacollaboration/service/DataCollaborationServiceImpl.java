package org.opendatadiscovery.oddplatform.datacollaboration.service;

import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.api.contract.model.Message;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannelList;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageRequest;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageChannelDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventRequest;
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
    private final AuthIdentityProvider authIdentityProvider;
    private final MessageProviderClientFactory messageProviderClientFactory;
    private final MessageProviderEventHandlerFactory messageProviderEventHandlerFactory;

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
            .filter(dataEntity -> !dataEntity.getHollow())
            .switchIfEmpty(Mono.error(new NotFoundException("Data entity", messageRequest.getDataEntityId())))
            .zipWith(messageProviderClientFactory
                .getOrFail(messageProvider)
                .getChannelById(messageRequest.getChannelId())
            )
            .flatMap(function((dataEntityId, channel) -> authIdentityProvider.fetchAssociatedOwner()
                .map(owner -> createMessagePojo(messageRequest, messageProvider, channel, owner.getId()))
                .switchIfEmpty(Mono.defer(() -> Mono.just(createMessagePojo(messageRequest, messageProvider, channel))))
                .flatMap(messageRepository::create)
                .map(messageMapper::mapPojo)));
    }

    @Override
    public Mono<Void> enqueueMessageEvent(final MessageEventRequest messageEvent) {
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

    private MessagePojo createMessagePojo(final MessageRequest messageRequest,
                                          final MessageProviderDto messageProvider,
                                          final MessageChannelDto channel) {
        return createMessagePojo(messageRequest, messageProvider, channel, null);
    }

    private MessagePojo createMessagePojo(final MessageRequest messageRequest,
                                          final MessageProviderDto messageProvider,
                                          final MessageChannelDto channel,
                                          final Long ownerId) {
        final UUID messageUUID = UUIDHelper.generateUUIDv1();
        final OffsetDateTime createdAt = UUIDHelper.extractDateTimeFromUUID(messageUUID);

        return new MessagePojo()
            .setUuid(messageUUID)
            .setCreatedAt(createdAt)
            .setDataEntityId(messageRequest.getDataEntityId())
            .setState(MessageStateDto.PENDING_SEND.getCode())
            .setProvider(messageProvider.toString())
            .setProviderChannelId(channel.id())
            .setProviderChannelName(channel.name())
            .setOwnerId(ownerId)
            .setText(messageRequest.getText());
    }
}
