package org.opendatadiscovery.oddplatform.datacollaboration.client;

import org.opendatadiscovery.oddplatform.datacollaboration.dto.SlackChannelDto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface SlackAPIClient {
    Flux<SlackChannelDto> getSlackChannels();

    Mono<Void> postMessage(final String channelId, final String string);
}
