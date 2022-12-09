package org.opendatadiscovery.oddplatform.dto.alert;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import static java.util.function.Function.identity;

public enum AlertTypeEnum {
    BACKWARDS_INCOMPATIBLE_SCHEMA(1, "Backwards incompatible schema"),
    FAILED_DQ_TEST(2, "Failed data quality test run"),
    FAILED_JOB(3, "Failed job run"),
    DISTRIBUTION_ANOMALY(4, "Distribution anomaly");

    @Getter
    private final short code;

    @Getter
    private final String description;

    AlertTypeEnum(final int code, final String description) {
        this.code = (short) code;
        this.description = description;
    }

    private static final Map<Short, AlertTypeEnum> DICT = Arrays
        .stream(values())
        .collect(Collectors.toMap(AlertTypeEnum::getCode, identity()));

    public static Optional<AlertTypeEnum> fromCode(final short code) {
        return Optional.ofNullable(DICT.get(code));
    }
}
