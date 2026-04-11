package org.opendatadiscovery.oddplatform.datacollaboration.service;

import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventPayload;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventRequest;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessageProviderEventPojo;
import reactor.core.publisher.Mono;

public interface MessageProviderEventHandler {
    Mono<Void> enqueueEvent(final MessageEventRequest messageEvent);

    MessageEventPayload payloadForCreate(final MessageProviderEventPojo event);

    MessageEventPayload payloadForUpdate(final MessageProviderEventPojo event);

    MessageProviderDto getProvider();
}