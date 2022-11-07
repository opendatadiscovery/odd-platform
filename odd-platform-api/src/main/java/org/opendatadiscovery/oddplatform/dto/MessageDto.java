package org.opendatadiscovery.oddplatform.dto;

import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;

public record MessageDto(MessagePojo message, long nestedMessages) {
}
