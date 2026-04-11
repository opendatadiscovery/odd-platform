package org.opendatadiscovery.oddplatform.datacollaboration.service;

import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;

public interface MessageProviderEventHandlerFactory {
    MessageProviderEventHandler getOrFail(final MessageProviderDto messageProvider);
}
