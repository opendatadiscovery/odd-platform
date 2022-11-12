package org.opendatadiscovery.oddplatform.datacollaboration.service;

import java.util.Set;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageUserDto;
import reactor.core.publisher.Flux;

public interface MessageProviderUserProfileResolver {
    Flux<MessageUserDto> resolve(final Set<String> userIds, final MessageProviderDto messageProvider);
}
