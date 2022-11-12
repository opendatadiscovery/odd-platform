package org.opendatadiscovery.oddplatform.datacollaboration.controller.parser;

import lombok.Builder;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventRequest;
import org.springframework.http.HttpStatus;

@Builder
public record ParseResult(MessageEventRequest messageEvent,
                          ParseResultType type,
                          HttpAck ack,
                          String filterMessage,
                          String errorMessage) {
    @Builder
    public record HttpAck(HttpStatus httpStatus, String body) {
    }

    public enum ParseResultType {
        CHALLENGE,
        PAYLOAD,
        FILTER,
        ERROR
    }
}
