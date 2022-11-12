package org.opendatadiscovery.oddplatform.repository;

import java.util.UUID;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageChannelDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventActionDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderIdentity;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MessageRepository {
    Mono<Boolean> exists(final UUID messageId);

    Mono<MessageProviderIdentity> getMessageProviderIdentity(final UUID messageId);

    Mono<UUID> getUUIDByProviderInfo(final String providerId,
                                     final MessageProviderDto messageProvider);

    Flux<MessagePojo> listParentMessagesByDataEntityId(final long dataEntityId,
                                                       final String channelId,
                                                       final UUID lastMessageId,
                                                       final int size);

    Flux<MessagePojo> listChildrenMessages(final UUID messageId,
                                           final UUID lastMessageId,
                                           final int size);

    Flux<MessageChannelDto> listChannelsByDataEntity(final long dataEntityId, final String channelNameLike);

    Mono<MessagePojo> create(final MessagePojo message);

    Mono<Void> createMessageEvent(final String event,
                                  final MessageEventActionDto action,
                                  final MessageProviderDto messageProvider,
                                  final UUID parentMessageUUID);
}