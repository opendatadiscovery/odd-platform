package org.opendatadiscovery.oddplatform.datacollaboration.client;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface SlackAPIClient {
    Flux<String> getChannelNames();

    Mono<Void> postMessage(final String channelId, final String string);
}
