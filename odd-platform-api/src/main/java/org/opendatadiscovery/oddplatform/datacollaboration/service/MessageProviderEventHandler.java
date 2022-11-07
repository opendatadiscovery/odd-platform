package org.opendatadiscovery.oddplatform.datacollaboration.service;

import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import reactor.core.publisher.Mono;

public interface MessageProviderEventHandler {
    Mono<Void> handleEvent(final MessageEventDto messageEvent);

    MessageProviderDto getProvider();
}