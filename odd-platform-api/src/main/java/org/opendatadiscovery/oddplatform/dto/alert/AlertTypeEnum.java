package org.opendatadiscovery.oddplatform.dto.alert;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import static java.util.function.Function.identity;

@RequiredArgsConstructor
public enum AlertTypeEnum {
    DISTRIBUTION_ANOMALY("Distribution anomaly"),
    BACKWARDS_INCOMPATIBLE_SCHEMA("Backwards incompatible schema"),
    FAILED_DQ_TEST("Failed data quality test run"),
    FAILED_JOB("Failed job run");

    @Getter
    private final String description;

    private static final Map<String, AlertTypeEnum> DICT = Arrays
        .stream(values())
        .collect(Collectors.toMap(AlertTypeEnum::name, identity()));

    public static Optional<AlertTypeEnum> getByName(final String name) {
        return Optional.ofNullable(DICT.get(name));
    }
}
