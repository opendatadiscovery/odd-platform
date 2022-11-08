package org.opendatadiscovery.oddplatform.datacollaboration.service;

import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageChannelDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MessageProviderClient {
    Flux<MessageChannelDto> getChannels();

    Flux<MessageChannelDto> getChannels(final String nameLike);

    Mono<MessageChannelDto> getChannelById(final String channelId);

    MessageProviderDto getProvider();
}
