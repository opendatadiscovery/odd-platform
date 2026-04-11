package org.opendatadiscovery.oddplatform.datacollaboration.dto;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import lombok.Getter;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;

public enum MessageEventActionDto {
    CREATE(1),
    UPDATE(2);

    private static final Map<Short, MessageEventActionDto> DICT = Arrays
        .stream(MessageEventActionDto.values())
        .collect(toMap(MessageEventActionDto::getCode, identity()));

    @Getter
    private final short code;

    MessageEventActionDto(final int code) {
        this.code = ((short) code);
    }

    public static Optional<MessageEventActionDto> fromCode(final short code) {
        return Optional.ofNullable(DICT.get(code));
    }
}
