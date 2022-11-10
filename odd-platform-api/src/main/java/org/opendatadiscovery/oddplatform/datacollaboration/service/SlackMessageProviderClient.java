package org.opendatadiscovery.oddplatform.datacollaboration.service;

import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.datacollaboration.client.SlackAPIClient;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageChannelDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageUserDto;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;

@Component
@RequiredArgsConstructor
@ConditionalOnDataCollaboration
public class SlackMessageProviderClient implements MessageProviderClient {
    private final SlackAPIClient slackAPIClient;

    @Override
    // TODO: find a way to get Slack channels that have bot installed
    public Flux<MessageChannelDto> getChannels() {
        return slackAPIClient.getSlackChannels();
    }

    @Override
    public Flux<MessageChannelDto> getChannels(final String nameLike) {
        return slackAPIClient.getSlackChannels()
            .filter(slackChannel -> slackChannel.name().startsWith(nameLike));
    }

    @Override
    public Mono<MessageChannelDto> getChannelById(final String channelId) {
        return slackAPIClient.exchangeForChannel(channelId);
    }

    @Override
    public Mono<String> getChannelUrl(final String channelId, final String providerMessageId) {
        return slackAPIClient.exchangeForUrl(channelId, providerMessageId);
    }

    @Override
    public Mono<Map<String, MessageUserDto>> getUserProfiles(final Set<String> userIds) {
        return slackAPIClient
            .exchangeForUserProfile(userIds)
            .collectMap(MessageUserDto::id, identity());
    }

    @Override
    public Mono<String> postMessage(final String channelId, final String messageText) {
        return slackAPIClient.postMessage(channelId, messageText);
    }

    @Override
    public MessageProviderDto getProvider() {
        return MessageProviderDto.SLACK;
    }
}
