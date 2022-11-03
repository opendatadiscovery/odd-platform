package org.opendatadiscovery.oddplatform.service;

import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannelList;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageList;
import org.opendatadiscovery.oddplatform.mapper.MessageMapper;
import org.opendatadiscovery.oddplatform.repository.MessageRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
@Service
public class MessageServiceImpl implements MessageService {
    private final MessageRepository messageRepository;
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
            .map(messageMapper::mapPojos);
    }

    @Override
    public Mono<MessageChannelList> getExistingMessagesChannels(final long dataEntityId, final String channelName) {
        return Mono.empty();
//        return messageRepository.listExistingChannels(dataEntityId, channelName)
//            .collectList()
//            .map(messageMapper::mapPojos);
    }
}
