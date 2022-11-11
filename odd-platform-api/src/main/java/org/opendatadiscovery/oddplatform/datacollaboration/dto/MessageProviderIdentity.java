package org.opendatadiscovery.oddplatform.datacollaboration.dto;

import lombok.Builder;

@Builder
public record MessageProviderIdentity(String providerMessageChannel,
                                      String providerMessageId,
                                      MessageProviderDto messageProvider) {
}
