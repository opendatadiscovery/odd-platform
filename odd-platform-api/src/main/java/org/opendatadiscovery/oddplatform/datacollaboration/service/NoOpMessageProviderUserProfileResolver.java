package org.opendatadiscovery.oddplatform.datacollaboration.service;

import java.util.Set;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageUserDto;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

@Component
@ConditionalOnDataCollaboration(enabled = false)
public class NoOpMessageProviderUserProfileResolver implements MessageProviderUserProfileResolver {
    @Override
    public Flux<MessageUserDto> resolve(final Set<String> userIds, final MessageProviderDto messageProvider) {
        return Flux.just();
    }
}
