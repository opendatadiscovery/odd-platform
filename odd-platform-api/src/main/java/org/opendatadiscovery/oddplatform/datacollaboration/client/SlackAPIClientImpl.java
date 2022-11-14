package org.opendatadiscovery.oddplatform.datacollaboration.client;

import com.slack.api.methods.AsyncMethodsClient;
import com.slack.api.methods.request.chat.ChatPostMessageRequest;
import com.slack.api.methods.request.conversations.ConversationsListRequest;
import com.slack.api.methods.response.conversations.ConversationsListResponse;
import com.slack.api.methods.response.users.UsersInfoResponse;
import com.slack.api.model.Attachment;
import com.slack.api.model.Conversation;
import com.slack.api.model.ConversationType;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageChannelDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageUserDto;
import org.opendatadiscovery.oddplatform.datacollaboration.exception.SlackAPIException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
@Slf4j
public class SlackAPIClientImpl implements SlackAPIClient {
    private static final int LIMIT_SIZE = 200;

    private final AsyncMethodsClient asyncMethodsClient;

    @Override
    public Flux<MessageChannelDto> getSlackChannels() {
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
            .filter(Conversation::isMember)
            .map(c -> MessageChannelDto.builder().id(c.getId()).name(c.getName()).build());
    }

    @Override
    public Mono<MessageChannelDto> exchangeForChannel(final String channelId) {
        return Mono.fromFuture(asyncMethodsClient.conversationsInfo(r -> r.channel(channelId)))
            .handle((response, sink) -> {
                if (!response.isOk()) {
                    sink.error(new SlackAPIException(response.getError()));
                }

                sink.next(MessageChannelDto.builder()
                    .id(channelId)
                    .name(response.getChannel().getName())
                    .build());
            });
    }

    @Override
    public Mono<String> postMessage(final String channelId, final List<Attachment> attachments) {
        final ChatPostMessageRequest req = ChatPostMessageRequest.builder()
            .attachments(attachments)
            .text("Message from OpenDataDiscovery platform!")
            .channel(channelId)
            .build();

        return Mono.fromFuture(asyncMethodsClient.chatPostMessage(req))
            .handle((response, sink) -> {
                if (!response.isOk()) {
                    sink.error(new SlackAPIException(response.getError()));
                    return;
                }

                sink.next(response.getTs());
            });
    }

    @Override
    public Mono<String> exchangeForUrl(final String channelId, final String messageTs) {
        return Mono
            .fromFuture(asyncMethodsClient.chatGetPermalink(r -> r.channel(channelId).messageTs(messageTs)))
            .handle((response, sink) -> {
                if (!response.isOk()) {
                    sink.error(new SlackAPIException(response.getError()));
                    return;
                }

                sink.next(response.getPermalink());
            });
    }

    @Override
    public Flux<MessageUserDto> exchangeForUserProfile(final Set<String> userIds) {
        if (CollectionUtils.isEmpty(userIds)) {
            return Flux.just();
        }

        final List<Mono<UsersInfoResponse>> monos = userIds.stream()
            .map(userId -> asyncMethodsClient.usersInfo(r -> r.user(userId)))
            .map(Mono::fromFuture)
            .toList();

        return Flux.concat(monos)
            .handle((response, sink) -> {
                if (!response.isOk()) {
                    log.error("Couldn't get Slack user info: {}", response.getError());
                    return;
                }

                final MessageUserDto messageUser = MessageUserDto.builder()
                    .id(response.getUser().getId())
                    .name(response.getUser().getName())
                    .userAvatar(response.getUser().getProfile().getImage24())
                    .build();

                sink.next(messageUser);
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