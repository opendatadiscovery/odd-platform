package org.opendatadiscovery.oddplatform.datacollaboration.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.SlackChannelList;
import org.opendatadiscovery.oddplatform.datacollaboration.client.SlackAPIClient;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.mapper.DataCollaborationMapper;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
@Service
@ConditionalOnDataCollaboration
public class DataCollaborationServiceImpl implements DataCollaborationService {
    private final SlackAPIClient slackAPIClient;
    private final DataCollaborationMapper dataCollaborationMapper;

    @Override
    public Mono<SlackChannelList> getSlackChannels() {
        return slackAPIClient.getSlackChannels()
            .collectList()
            .map(dataCollaborationMapper::mapSlackChannelList);
    }
}
