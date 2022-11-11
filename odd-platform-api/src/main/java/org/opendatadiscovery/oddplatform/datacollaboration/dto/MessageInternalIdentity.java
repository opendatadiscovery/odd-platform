package org.opendatadiscovery.oddplatform.datacollaboration.dto;

import java.time.OffsetDateTime;
import lombok.Builder;

@Builder
public record MessageInternalIdentity(long key, OffsetDateTime createdAt) {
}
