package org.opendatadiscovery.oddplatform.datacollaboration.client;

import com.slack.api.methods.AsyncMethodsClient;
import com.slack.api.methods.request.chat.ChatPostMessageRequest;
import com.slack.api.methods.request.conversations.ConversationsListRequest;
import com.slack.api.methods.response.conversations.ConversationsListResponse;
import com.slack.api.model.ConversationType;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.SlackChannelDto;
import org.opendatadiscovery.oddplatform.datacollaboration.exception.SlackAPIException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static com.slack.api.model.block.Blocks.section;
import static com.slack.api.model.block.composition.BlockCompositions.markdownText;

@RequiredArgsConstructor
@Slf4j
public class SlackAPIClientImpl implements SlackAPIClient {
    private static final int LIMIT_SIZE = 200;

    private final AsyncMethodsClient asyncMethodsClient;

    @Override
    public Flux<SlackChannelDto> getSlackChannels() {
        return requestConversationList()
            .expand(response -> {
                if (!response.isOk()) {
                    return Mono.error(new SlackAPIException(response.getError()));
                }

                if (StringUtils.isNotEmpty(response.getResponseMetadata().getNextCursor())) {
                    return requestConversationList(response.getResponseMetadata().getNextCursor());
                }

                return Mono.empty();
            })
            .flatMap(response -> Flux.fromIterable(response.getChannels()))
            .map(c -> SlackChannelDto.builder().id(c.getId()).name(c.getName()).build());
    }

    @Override
    public Mono<Void> postMessage(final String channelId, final String string) {
        final ChatPostMessageRequest req = ChatPostMessageRequest.builder()
            .blocks(List.of(section(b -> b.text(markdownText("Hello world from " + string)))))
            .channel(channelId)
            .build();

        return Mono.fromFuture(asyncMethodsClient.chatPostMessage(req))
            .handle((response, sink) -> {
                if (!response.isOk()) {
                    sink.error(new SlackAPIException(response.getError()));
                    return;
                }

                sink.complete();
            });
    }

    private Mono<ConversationsListResponse> requestConversationList() {
        return requestConversationList(null);
    }

    private Mono<ConversationsListResponse> requestConversationList(final String cursor) {
        final ConversationsListRequest request = ConversationsListRequest.builder()
            .excludeArchived(true)
            .types(List.of(ConversationType.PUBLIC_CHANNEL))
            .limit(LIMIT_SIZE)
            .build();

        if (cursor != null) {
            request.setCursor(cursor);
        }

        return Mono.fromFuture(asyncMethodsClient.conversationsList(request));
    }
}