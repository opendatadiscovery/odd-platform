package org.opendatadiscovery.oddplatform.datacollaboration.client;

import reactor.core.publisher.Flux;

public interface SlackAPIClient {
    Flux<String> getChannelNames();
}
