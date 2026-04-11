package org.opendatadiscovery.oddplatform.datacollaboration.dto;

import lombok.Builder;

@Builder
public record MessageEventPayload(String messageId, String messageText, String messageAuthor) {
}
