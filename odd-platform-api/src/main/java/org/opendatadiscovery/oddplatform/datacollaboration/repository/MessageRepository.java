package org.opendatadiscovery.oddplatform.datacollaboration.repository;

import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessageProviderEventPojo;
import reactor.core.publisher.Mono;

public interface MessageRepository {
    Mono<MessagePojo> create(final MessagePojo message);

    Mono<MessageProviderEventPojo> createMessageEvent(final String event, final MessageProviderDto messageProvider);
}
