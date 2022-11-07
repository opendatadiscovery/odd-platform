package org.opendatadiscovery.oddplatform.datacollaboration.dto;

import lombok.Builder;

@Builder
public record MessageEventDto(Object event,
                              MessageProviderDto provider,
                              MessageEventActionDto action) {
}
