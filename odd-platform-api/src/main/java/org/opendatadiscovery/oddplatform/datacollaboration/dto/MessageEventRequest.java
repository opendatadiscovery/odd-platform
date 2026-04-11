package org.opendatadiscovery.oddplatform.datacollaboration.dto;

import lombok.Builder;

@Builder
public record MessageEventRequest(Object event,
                                  MessageProviderDto provider,
                                  MessageEventActionDto action) {
}
