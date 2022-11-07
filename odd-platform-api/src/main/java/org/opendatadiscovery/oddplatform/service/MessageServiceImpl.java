package org.opendatadiscovery.oddplatform.service;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannelList;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageList;
import org.opendatadiscovery.oddplatform.datacollaboration.client.SlackAPIClient;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageUserDto;
import org.opendatadiscovery.oddplatform.mapper.MessageMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.repository.MessageRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static reactor.function.TupleUtils.function;

@RequiredArgsConstructor
@Service
public class MessageServiceImpl implements MessageService {
    private final MessageRepository messageRepository;
    private final SlackAPIClient slackAPIClient;
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
                final Set<String> userIds = messages.stream()
                    .map(MessagePojo::getProviderMessageAuthor)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

                return slackAPIClient
                    .exchangeForUserProfile(userIds)
                    .collectMap(MessageUserDto::id, identity());
            })
            .map(function(messageMapper::mapPojos));
    }

    @Override
    public Mono<MessageChannelList> getExistingMessagesChannels(final long dataEntityId, final String channelName) {
        return Mono.empty();
//        return messageRepository.listExistingChannels(dataEntityId, channelName)
//            .collectList()
//            .map(messageMapper::mapPojos);
    }
}
