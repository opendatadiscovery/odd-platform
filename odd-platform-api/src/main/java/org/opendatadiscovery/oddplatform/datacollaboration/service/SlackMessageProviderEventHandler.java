package org.opendatadiscovery.oddplatform.datacollaboration.service;

import com.slack.api.model.event.MessageChangedEvent;
import com.slack.api.model.event.MessageEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
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
    public Mono<Void> handleEvent(final MessageEventDto messageEvent) {
        return switch (messageEvent.action()) {
            case CREATE -> {
                final MessageEvent slackEvent = (MessageEvent) messageEvent.event();

                yield messageRepository.getIdByProviderId(slackEvent.getThreadTs())
                    .switchIfEmpty(Mono.defer(() -> {
                        log.debug("Message {} is not a reply thread for tracked messages", slackEvent);
                        return Mono.empty();
                    }))
                    .flatMap(parentMessageId -> messageRepository.createMessageEventForCreate(
                        GsonHelper.toJson(slackEvent),
                        MessageProviderDto.SLACK,
                        parentMessageId
                    ))
                    .then();
            }
            case UPDATE -> {
                final MessageChangedEvent slackEvent = (MessageChangedEvent) messageEvent.event();

                yield messageRepository.getIdByProviderId(slackEvent.getTs())
                    .switchIfEmpty(Mono.defer(() -> {
                        log.debug("Message {} is not tracked by ODD", slackEvent);
                        return Mono.empty();
                    }))
                    .flatMap(messageId -> messageRepository.createMessageEventForUpdate(
                        GsonHelper.toJson(slackEvent),
                        MessageProviderDto.SLACK,
                        messageId
                    ))
                    .then();
            }
        };
    }

    @Override
    public MessageProviderDto getProvider() {
        return MessageProviderDto.SLACK;
    }
}
