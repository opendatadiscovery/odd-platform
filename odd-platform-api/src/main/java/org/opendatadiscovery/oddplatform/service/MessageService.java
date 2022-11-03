package org.opendatadiscovery.oddplatform.service;

import java.time.OffsetDateTime;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannelList;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageList;
import reactor.core.publisher.Mono;

public interface MessageService {
    Mono<MessageList> getMessagesByDataEntityId(final long dataEntityId,
                                                final String channelId,
                                                final Long lastMessageId,
                                                final OffsetDateTime lastMessageDateTime,
                                                final int size);

    Mono<MessageList> getChildrenMessages(final long messageId,
                                                 final Long lastMessageId,
                                                 final OffsetDateTime lastMessageDateTime,
                                                 final int size);

    Mono<MessageChannelList> getExistingMessagesChannels(final long dataEntityId, final String channelName);
}
