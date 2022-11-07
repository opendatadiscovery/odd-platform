package org.opendatadiscovery.oddplatform.repository;

import java.time.OffsetDateTime;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessageProviderEventPojo;
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

    Mono<MessagePojo> create(final MessagePojo message);

    Mono<MessageProviderEventPojo> createMessageEventForCreate(final String event,
                                                               final MessageProviderDto messageProvider,
                                                               final long parentMessageId);


    Mono<MessageProviderEventPojo> createMessageEventForUpdate(final String event,
                                                               final MessageProviderDto messageProvider,
                                                               final long messageId);

    Mono<Long> getIdByProviderId(final String providerId);
}
