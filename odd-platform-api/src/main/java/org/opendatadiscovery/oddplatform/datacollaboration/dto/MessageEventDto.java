package org.opendatadiscovery.oddplatform.datacollaboration.dto;

import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessageProviderEventPojo;

public record MessageEventDto(MessageProviderEventPojo event, MessagePojo parentMessage) {
}
