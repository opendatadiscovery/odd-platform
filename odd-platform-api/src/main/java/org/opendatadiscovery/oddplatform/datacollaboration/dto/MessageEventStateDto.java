package org.opendatadiscovery.oddplatform.datacollaboration.dto;

import lombok.Getter;

public enum MessageEventStateDto {
    PENDING(1),
    PROCESSING_FAILED(2);
    @Getter
    private final short code;

    MessageEventStateDto(final int code) {
        this.code = ((short) code);
    }
}
