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
public class MessageProviderEventHandlerFactoryImpl implements MessageProviderEventHandlerFactory {
    private final Map<MessageProviderDto, MessageProviderEventHandler> messageProviderEventHandlers;

    public MessageProviderEventHandlerFactoryImpl(
        final List<MessageProviderEventHandler> messageProviderEventHandlers
    ) {
        this.messageProviderEventHandlers = messageProviderEventHandlers.stream().collect(toMap(
            MessageProviderEventHandler::getProvider,
            identity()
        ));
    }

    @Override
    public MessageProviderEventHandler getOrFail(final MessageProviderDto messageProvider) {
        final MessageProviderEventHandler messageProviderEventHandler =
            messageProviderEventHandlers.get(messageProvider);

        if (messageProviderEventHandler == null) {
            throw new IllegalStateException(
                "No message provider event handler found for %s".formatted(messageProvider));
        }

        return messageProviderEventHandler;
    }
}
