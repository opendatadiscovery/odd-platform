package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Getter;

import static java.util.function.Function.identity;

public enum EnumValueOrigin {
    INTERNAL(1),
    EXTERNAL(2);

    @Getter
    private final short code;

    EnumValueOrigin(final int code) {
        this.code = (short) code;
    }

    private static final Map<Short, EnumValueOrigin> DICT = Arrays
        .stream(values())
        .collect(Collectors.toMap(EnumValueOrigin::getCode, identity()));

    public static Optional<EnumValueOrigin> fromCode(final short code) {
        return Optional.ofNullable(DICT.get(code));
    }
}