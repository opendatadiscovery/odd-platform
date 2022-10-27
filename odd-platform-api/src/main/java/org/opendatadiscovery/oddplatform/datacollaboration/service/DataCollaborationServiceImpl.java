package org.opendatadiscovery.oddplatform.datacollaboration.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.Message;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageChannelList;
import org.opendatadiscovery.oddplatform.api.contract.model.MessageRequest;
import org.opendatadiscovery.oddplatform.datacollaboration.client.SlackAPIClient;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.mapper.DataCollaborationMapper;
import org.opendatadiscovery.oddplatform.datacollaboration.repository.MessageRepository;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
@Service
@ConditionalOnDataCollaboration
public class DataCollaborationServiceImpl implements DataCollaborationService {
    private final SlackAPIClient slackAPIClient;
    private final MessageRepository messageRepository;
    private final DataCollaborationMapper dataCollaborationMapper;

    @Override
    // TODO: find a way to get slack channels that have bot installed
    public Mono<MessageChannelList> getSlackChannels() {
        return slackAPIClient.getSlackChannels()
            .collectList()
            .map(dataCollaborationMapper::mapSlackChannelList);
    }

    @Override
    public Mono<Message> createMessage(final MessageRequest messageRequest) {
        final MessagePojo messagePojo = new MessagePojo()
            .setDataEntityId(messageRequest.getDataEntityId())
            .setChannelId(messageRequest.getChannelId())
            .setMessageText(messageRequest.getText());

        return messageRepository.create(messagePojo)
            .map(pojo -> new Message()
                .id(pojo.getId())
                .text(pojo.getMessageText())
                .createdAt(pojo.getCreatedAt()));
    }
}
