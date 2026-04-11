package org.opendatadiscovery.oddplatform.datacollaboration.service;

import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;

public interface MessageProviderClientFactory {
    MessageProviderClient getOrFail(final MessageProviderDto messageProvider);
}
