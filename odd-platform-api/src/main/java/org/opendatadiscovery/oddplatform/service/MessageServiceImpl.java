package org.opendatadiscovery.oddplatform.service;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannelList;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageList;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.service.MessageProviderClientFactory;
import org.opendatadiscovery.oddplatform.mapper.MessageMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.repository.MessageRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static reactor.function.TupleUtils.function;

@RequiredArgsConstructor
@Service
public class MessageServiceImpl implements MessageService {
    private final MessageRepository messageRepository;
    private final MessageProviderClientFactory messageProviderClientFactory;
    private final MessageMapper messageMapper;

    @Override
    public Mono<MessageList> getMessagesByDataEntityId(final long dataEntityId,
                                                       final String channelId,
                                                       final Long lastMessageId,
                                                       final OffsetDateTime lastMessageDateTime,
                                                       final int size) {
        return messageRepository
            .listParentMessagesByDataEntityId(dataEntityId, channelId, lastMessageId, lastMessageDateTime, size)
            .collectList()
            .map(messageMapper::mapPojos);
    }

    @Override
    public Mono<MessageList> getChildrenMessages(final long messageId,
                                                 final Long lastMessageId,
                                                 final OffsetDateTime lastMessageDateTime,
                                                 final int size) {
        return messageRepository.listChildrenMessages(messageId, lastMessageId, lastMessageDateTime, size)
            .collectList()
            .zipWhen(messages -> {
                if (CollectionUtils.isEmpty(messages)) {
                    return Mono.empty();
                }

                // assuming children messages have the same provider as the parent message
                final Set<String> userIds = messages.stream()
                    .map(MessagePojo::getProviderMessageAuthor)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

                final MessageProviderDto provider = messages.stream()
                    .map(MessagePojo::getProvider)
                    .map(MessageProviderDto::valueOf)
                    .findFirst()
                    .get();

                return messageProviderClientFactory.getOrFail(provider).getUserProfiles(userIds);
            })
            .map(function(messageMapper::mapPojos));
    }

    @Override
    public Mono<MessageChannelList> getExistingMessagesChannels(final long dataEntityId, final String channelName) {
        return messageRepository.listChannelsByDataEntity(dataEntityId, channelName)
            .collectList()
            .map(messageMapper::mapSlackChannelList);
    }
}