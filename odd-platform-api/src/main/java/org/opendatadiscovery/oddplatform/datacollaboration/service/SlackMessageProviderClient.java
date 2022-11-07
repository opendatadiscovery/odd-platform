package org.opendatadiscovery.oddplatform.datacollaboration.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.datacollaboration.client.SlackAPIClient;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageChannelDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

@Component
@RequiredArgsConstructor
@ConditionalOnDataCollaboration
public class SlackMessageProviderClient implements MessageProviderClient {
    private final SlackAPIClient slackAPIClient;

    @Override
    public Flux<MessageChannelDto> getChannels() {
        return slackAPIClient.getSlackChannels();
    }

    @Override
    public Flux<MessageChannelDto> getChannels(final String nameLike) {
        return slackAPIClient.getSlackChannels().filter(slackChannel -> slackChannel.name().startsWith(nameLike));
    }

    @Override
    public MessageProviderDto getProvider() {
        return MessageProviderDto.SLACK;
    }
}
