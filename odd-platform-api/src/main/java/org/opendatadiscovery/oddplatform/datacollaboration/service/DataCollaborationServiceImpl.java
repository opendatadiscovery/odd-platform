package org.opendatadiscovery.oddplatform.datacollaboration.service;

import com.slack.api.model.event.MessageEvent;
import com.slack.api.util.json.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.api.contract.model.Message;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannelList;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageState;
import org.opendatadiscovery.oddplatform.datacollaboration.client.SlackAPIClient;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.mapper.DataCollaborationMapper;
import org.opendatadiscovery.oddplatform.datacollaboration.repository.MessageRepository;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
@Service
@ConditionalOnDataCollaboration
@Slf4j
public class DataCollaborationServiceImpl implements DataCollaborationService {
    private final SlackAPIClient slackAPIClient;
    private final MessageRepository messageRepository;
    private final DataCollaborationMapper dataCollaborationMapper;

    @Override
    public Mono<MessageChannelList> getSlackChannels() {
        return slackAPIClient.getSlackChannels()
            .collectList()
            .map(dataCollaborationMapper::mapSlackChannelList);
    }

    @Override
    // TODO: find a way to get slack channels that have bot installed
    public Mono<MessageChannelList> getSlackChannels(final String channelNameStartsWith) {
        return slackAPIClient.getSlackChannels()
            .filter(slackChannel -> slackChannel.name().startsWith(channelNameStartsWith))
            .collectList()
            .map(dataCollaborationMapper::mapSlackChannelList);
    }

    @Override
    public Mono<Message> createAndSendMessage(final MessageRequest messageRequest,
                                              final MessageProviderDto messageProvider) {
        final MessagePojo messagePojo = new MessagePojo()
            .setDataEntityId(messageRequest.getDataEntityId())
            .setState(MessageStateDto.PENDING_SEND.toString())
            .setProvider(messageProvider.toString())
            .setChannelId(messageRequest.getChannelId())
            .setMessageText(messageRequest.getText());

        return messageRepository.create(messagePojo)
            .map(pojo -> new Message()
                .id(pojo.getId())
                .text(pojo.getMessageText())
                .createdAt(pojo.getCreatedAt())
                .state(MessageState.fromValue(pojo.getState()))
            );
    }

    @Override
    public Mono<Void> enqueueMessageEvent(final MessageEvent messageEvent, final MessageProviderDto messageProvider) {
        final String event = GsonFactory.createSnakeCase().toJson(messageEvent);

        return messageRepository.getIdByProviderId(messageEvent.getThreadTs())
            .switchIfEmpty(Mono.defer(() -> {
                log.debug("Message {} is not a reply thread for tracked messages", messageEvent);
                return Mono.empty();
            }))
            .flatMap(parentMessageId -> messageRepository.createMessageEvent(event, messageProvider, parentMessageId))
            .then();
    }
}
