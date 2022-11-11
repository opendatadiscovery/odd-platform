package org.opendatadiscovery.oddplatform.datacollaboration.dto;

import java.util.Arrays;
import java.util.Map;
import lombok.Getter;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;

public enum MessageEventStateDto {
    PENDING(1),
    PROCESSING_FAILED(2);

    private static final Map<Short, MessageEventStateDto> DICT = Arrays
        .stream(MessageEventStateDto.values())
        .collect(toMap(MessageEventStateDto::getCode, identity()));

    @Getter
    private final short code;

    MessageEventStateDto(final int code) {
        this.code = ((short) code);
    }

    public static MessageEventStateDto fromCode(final short code) {
        return DICT.get(code);
    }
}
