package org.opendatadiscovery.oddplatform.datacollaboration.service;

import com.slack.api.model.Attachment;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.datacollaboration.client.SlackAPIClient;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.DataEntityMessageContext;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageChannelDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageUserDto;
import org.opendatadiscovery.oddplatform.notification.processor.message.SlackMessageGenerator;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
@ConditionalOnDataCollaboration
public class SlackMessageProviderClient implements MessageProviderClient {
    private final SlackMessageGenerator slackMessageGenerator;
    private final SlackAPIClient slackAPIClient;

    @Override
    public Flux<MessageChannelDto> getChannels(final String nameLike) {
        final Flux<MessageChannelDto> messages = slackAPIClient.getSlackChannels();

        if (StringUtils.isNotEmpty(nameLike)) {
            return messages.filter(slackChannel -> slackChannel.name().startsWith(nameLike));
        }

        return messages;
    }

    @Override
    public Mono<MessageChannelDto> getChannelById(final String channelId) {
        return slackAPIClient.exchangeForChannel(channelId);
    }

    @Override
    public Mono<String> resolveMessageUrl(final String providerChannelId, final String providerMessageId) {
        return slackAPIClient.exchangeForUrl(providerChannelId, providerMessageId);
    }

    @Override
    public Flux<MessageUserDto> getUserProfiles(final Set<String> userIds) {
        return slackAPIClient.exchangeForUserProfile(userIds);
    }

    @Override
    public Mono<String> postMessage(final DataEntityMessageContext messageContext) {
        final List<Attachment> preparedMessageLayout = slackMessageGenerator.generateMessage(messageContext);

        return slackAPIClient.postMessage(messageContext.message().getProviderChannelId(), preparedMessageLayout);
    }

    @Override
    public MessageProviderDto getProvider() {
        return MessageProviderDto.SLACK;
    }
}
