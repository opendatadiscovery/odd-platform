package org.opendatadiscovery.oddplatform.datacollaboration.dto;

import lombok.Builder;

@Builder
public record MessageIdentity(String providerMessageChannel,
                              String providerMessageId,
                              MessageProviderDto messageProvider) {
}
