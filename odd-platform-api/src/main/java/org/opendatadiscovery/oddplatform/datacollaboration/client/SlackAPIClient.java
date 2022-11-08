package org.opendatadiscovery.oddplatform.datacollaboration.client;

import java.util.Set;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageChannelDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageUserDto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface SlackAPIClient {
    Flux<MessageChannelDto> getSlackChannels();

    Mono<MessageChannelDto> exchangeForChannel(final String channelId);

    Mono<String> postMessage(final String channelId, final String string);

    Mono<String> exchangeForUrl(final String channelId, final String messageTs);

    Flux<MessageUserDto> exchangeForUserProfile(final Set<String> userIds);
}
