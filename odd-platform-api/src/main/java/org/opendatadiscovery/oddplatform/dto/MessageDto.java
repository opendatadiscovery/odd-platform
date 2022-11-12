package org.opendatadiscovery.oddplatform.dto;

import lombok.Builder;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;

@Builder
public record MessageDto(MessagePojo message, long childrenMessagesCount) {
}
