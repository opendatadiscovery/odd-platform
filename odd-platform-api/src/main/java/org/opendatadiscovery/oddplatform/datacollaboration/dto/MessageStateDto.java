package org.opendatadiscovery.oddplatform.datacollaboration.dto;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;

@RequiredArgsConstructor
public enum MessageStateDto {
    PENDING_SEND(1),
    SENT(2),
    EXTERNAL(3),
    DELETED(4),
    ERROR_SENDING(5);

    private static final Map<Short, MessageStateDto> DICT = Arrays
        .stream(MessageStateDto.values())
        .collect(toMap(MessageStateDto::getCode, identity()));

    @Getter
    private final short code;

    MessageStateDto(final int code) {
        this.code = ((short) code);
    }

    public static Optional<MessageStateDto> fromCode(final short code) {
        return Optional.ofNullable(DICT.get(code));
    }
}