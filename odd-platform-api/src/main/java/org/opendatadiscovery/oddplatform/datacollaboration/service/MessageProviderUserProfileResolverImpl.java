package org.opendatadiscovery.oddplatform.datacollaboration.service;

import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageUserDto;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

@Component
@RequiredArgsConstructor
@ConditionalOnDataCollaboration
public class MessageProviderUserProfileResolverImpl implements MessageProviderUserProfileResolver {
    private final MessageProviderClientFactory messageProviderClientFactory;

    @Override
    public Flux<MessageUserDto> resolve(final Set<String> userIds, final MessageProviderDto messageProvider) {
        return messageProviderClientFactory.getOrFail(messageProvider).getUserProfiles(userIds);
    }
}
