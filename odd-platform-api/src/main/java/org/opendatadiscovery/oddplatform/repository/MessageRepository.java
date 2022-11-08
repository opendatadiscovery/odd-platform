package org.opendatadiscovery.oddplatform.repository;

import java.time.OffsetDateTime;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageChannelDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventActionDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MessageRepository {
    Flux<MessagePojo> listParentMessagesByDataEntityId(final long dataEntityId,
                                                       final String channelId,
                                                       final Long lastMessageId,
                                                       final OffsetDateTime lastMessageDateTime,
                                                       final int size);

    Flux<MessagePojo> listChildrenMessages(final long messageId,
                                           final Long lastMessageId,
                                           final OffsetDateTime lastMessageDateTime,
                                           final int size);

    Flux<MessageChannelDto> listChannelsByDataEntity(final long dataEntityId, final String channelNameLike);

    Mono<MessagePojo> create(final MessagePojo message);

    Mono<Void> createMessageEvent(final String event,
                                  final MessageEventActionDto action,
                                  final MessageProviderDto messageProvider);

    Mono<Void> createMessageEvent(final String event,
                                  final MessageEventActionDto action,
                                  final MessageProviderDto messageProvider,
                                  final Long parentMessageId);

    Mono<Long> getIdByProviderId(final String providerId);
}
