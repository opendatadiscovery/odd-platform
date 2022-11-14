package org.opendatadiscovery.oddplatform.datacollaboration.service;

import com.slack.api.model.event.MessageChangedEvent;
import com.slack.api.model.event.MessageEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventPayload;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventRequest;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessageProviderEventPojo;
import org.opendatadiscovery.oddplatform.repository.MessageRepository;
import org.opendatadiscovery.oddplatform.utils.GsonHelper;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@ConditionalOnDataCollaboration
@RequiredArgsConstructor
@Slf4j
public class SlackMessageProviderEventHandler implements MessageProviderEventHandler {
    private final MessageRepository messageRepository;

    @Override
    public Mono<Void> enqueueEvent(final MessageEventRequest messageEvent) {
        final String parentMessageProviderId = switch (messageEvent.action()) {
            case CREATE -> ((MessageEvent) messageEvent.event()).getThreadTs();
            case UPDATE -> ((MessageChangedEvent) messageEvent.event()).getMessage().getThreadTs();
        };

        return messageRepository.getUUIDByProviderInfo(parentMessageProviderId, messageEvent.provider())
            .switchIfEmpty(Mono.defer(() -> {
                log.debug("Message is not a reply thread for tracked messages: {}", messageEvent.event());
                return Mono.empty();
            }))
            .flatMap(uuid -> messageRepository.createMessageEvent(
                GsonHelper.toJson(messageEvent.event()),
                messageEvent.action(),
                messageEvent.provider(),
                uuid
            ))
            .then();
    }

    @Override
    public MessageEventPayload payloadForCreate(final MessageProviderEventPojo event) {
        final MessageEvent slackEvent = GsonHelper.fromJson(event.getEvent().data(), MessageEvent.class);

        return buildPayload(slackEvent.getTs(), slackEvent.getText(), slackEvent.getUser());
    }

    @Override
    public MessageEventPayload payloadForUpdate(final MessageProviderEventPojo event) {
        final MessageChangedEvent slackEvent = GsonHelper.fromJson(event.getEvent().data(), MessageChangedEvent.class);

        return buildPayload(slackEvent.getMessage().getTs(), slackEvent.getMessage().getText(), null);
    }

    @Override
    public MessageProviderDto getProvider() {
        return MessageProviderDto.SLACK;
    }

    private MessageEventPayload buildPayload(final String messageTs,
                                             final String messageText,
                                             final String messageAuthor) {
        return MessageEventPayload.builder()
            .messageId(messageTs)
            .messageText(messageText)
            .messageAuthor(messageAuthor)
            .build();
    }
}
