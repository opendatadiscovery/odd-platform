package org.opendatadiscovery.oddplatform.dto.alert;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import lombok.Getter;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;

public enum AlertStatusEnum {
    OPEN(1),
    RESOLVED(2),
    RESOLVED_AUTOMATICALLY(3);

    @Getter
    private final short code;

    private static final Map<Short, AlertStatusEnum> DICT = Arrays
        .stream(AlertStatusEnum.values())
        .collect(toMap(AlertStatusEnum::getCode, identity()));

    AlertStatusEnum(final int code) {
        this.code = (short) code;
    }

    public static Optional<AlertStatusEnum> fromCode(final short code) {
        return Optional.ofNullable(DICT.get(code));
    }
}
