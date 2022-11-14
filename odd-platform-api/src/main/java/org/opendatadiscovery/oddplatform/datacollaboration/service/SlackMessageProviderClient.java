package org.opendatadiscovery.oddplatform.datacollaboration.service;

import com.github.benmanes.caffeine.cache.AsyncLoadingCache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.slack.api.model.Attachment;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import javax.annotation.PostConstruct;
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

import static java.util.function.Function.identity;

@Component
@RequiredArgsConstructor
@ConditionalOnDataCollaboration
public class SlackMessageProviderClient implements MessageProviderClient {
    private static final String CACHE_FIXED_KEY = "CACHE_FIXED_KEY";

    private final SlackMessageGenerator slackMessageGenerator;
    private final SlackAPIClient slackAPIClient;
    private AsyncLoadingCache<String, Map<String, MessageChannelDto>> cache;

    @PostConstruct
    public void init() {
        this.cache = Caffeine.newBuilder()
            .maximumSize(1)
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .buildAsync((key, ex) -> slackAPIClient.getSlackChannels()
                .collectMap(MessageChannelDto::id, identity())
                .toFuture());
    }

    @Override
    public Flux<MessageChannelDto> getChannels(final String nameLike) {
        final Flux<MessageChannelDto> messages =
            Mono.fromFuture(cache.get(CACHE_FIXED_KEY)).flatMapIterable(Map::values);

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
