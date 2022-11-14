package org.opendatadiscovery.oddplatform.datacollaboration.service;

import java.util.Set;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.DataEntityMessageContext;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageChannelDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageUserDto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MessageProviderClient {
    Flux<MessageChannelDto> getChannels(final String nameLike);

    Mono<MessageChannelDto> getChannelById(final String channelId);

    Mono<String> resolveMessageUrl(final String providerChannelId, final String providerMessageId);

    Flux<MessageUserDto> getUserProfiles(final Set<String> userIds);

    Mono<String> postMessage(final DataEntityMessageContext messageContext);

    MessageProviderDto getProvider();
}
