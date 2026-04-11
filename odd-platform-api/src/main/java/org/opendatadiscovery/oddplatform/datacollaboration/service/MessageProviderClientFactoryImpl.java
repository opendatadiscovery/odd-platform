package org.opendatadiscovery.oddplatform.datacollaboration.service;

import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.springframework.stereotype.Component;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;

@Component
@ConditionalOnDataCollaboration
public class MessageProviderClientFactoryImpl implements MessageProviderClientFactory {
    private final Map<MessageProviderDto, MessageProviderClient> messageProviderClients;

    public MessageProviderClientFactoryImpl(final List<MessageProviderClient> messageProviderClients) {
        this.messageProviderClients = messageProviderClients.stream().collect(toMap(
            MessageProviderClient::getProvider,
            identity()
        ));
    }

    @Override
    public MessageProviderClient getOrFail(final MessageProviderDto messageProvider) {
        final MessageProviderClient messageProviderClient = messageProviderClients.get(messageProvider);
        if (messageProviderClient == null) {
            throw new IllegalStateException(
                "No message provider client found for %s".formatted(messageProvider.toString()));
        }

        return messageProviderClient;
    }
}
