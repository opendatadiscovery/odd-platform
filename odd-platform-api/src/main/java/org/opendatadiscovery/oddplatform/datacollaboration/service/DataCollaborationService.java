package org.opendatadiscovery.oddplatform.datacollaboration.service;

import org.opendatadiscovery.oddplatform.api.contract.model.SlackChannelList;
import reactor.core.publisher.Mono;

public interface DataCollaborationService {
    Mono<SlackChannelList> getSlackChannels();
}
