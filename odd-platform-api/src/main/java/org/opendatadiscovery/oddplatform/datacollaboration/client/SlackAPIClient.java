package org.opendatadiscovery.oddplatform.datacollaboration.client;

import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageChannelDto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface SlackAPIClient {
    Flux<MessageChannelDto> getSlackChannels();

    Mono<String> postMessage(final String channelId, final String string);
}
