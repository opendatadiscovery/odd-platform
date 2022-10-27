package org.opendatadiscovery.oddplatform.datacollaboration.repository;

import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import reactor.core.publisher.Mono;

public interface MessageRepository {
    Mono<MessagePojo> create(final MessagePojo message);

    Mono<MessagePojo> getSendingCandidate();

    Mono<MessagePojo> markMessageAsSent(final long messageId);
}
