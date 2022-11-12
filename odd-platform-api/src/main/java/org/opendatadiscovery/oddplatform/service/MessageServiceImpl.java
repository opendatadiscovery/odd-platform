package org.opendatadiscovery.oddplatform.service;

import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannelList;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageList;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageUserDto;
import org.opendatadiscovery.oddplatform.datacollaboration.service.MessageProviderUserProfileResolver;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.MessageMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.repository.MessageRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static reactor.function.TupleUtils.function;

@RequiredArgsConstructor
@Service
@Slf4j
public class MessageServiceImpl implements MessageService {
    private final MessageRepository messageRepository;
    private final MessageProviderUserProfileResolver userProfileResolver;
    private final MessageMapper messageMapper;

    @Override
    public Mono<MessageList> getMessagesByDataEntityId(final long dataEntityId,
                                                       final String channelId,
                                                       final UUID lastMessageId,
                                                       final int size) {
        return messageRepository
            .listParentMessagesByDataEntityId(dataEntityId, channelId, lastMessageId, size)
            .collectList()
            .map(messageMapper::mapPojos);
    }

    @Override
    public Mono<MessageList> getChildrenMessages(final UUID messageId,
                                                 final UUID lastMessageId,
                                                 final int size) {
        return messageRepository.exists(messageId)
            .handle((exists, sink) -> {
                if (!exists) {
                    sink.error(new NotFoundException("Message", messageId));
                }
            })
            .thenMany(messageRepository.listChildrenMessages(messageId, lastMessageId, size))
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

                return userProfileResolver.resolve(userIds, provider).collectMap(MessageUserDto::id, identity());
            })
            .map(function(messageMapper::mapPojos))
            .switchIfEmpty(Mono.just(new MessageList()));
    }

    @Override
    public Mono<MessageChannelList> getExistingMessagesChannels(final long dataEntityId, final String channelName) {
        return messageRepository.listChannelsByDataEntity(dataEntityId, channelName)
            .collectList()
            .map(messageMapper::mapSlackChannelList);
    }
}
