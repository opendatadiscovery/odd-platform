package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.Getter;

import static java.util.function.Function.identity;

@Getter
public enum DataQualityCategory {
    ASSERTION("Assertion Tests"),
    VOLUME_ANOMALY("Volume Anomalies"),
    FRESHNESS_ANOMALY("Freshness Anomalies"),
    COLUMN_VALUES_ANOMALY("Column Values Anomalies"),
    SCHEMA_CHANGE("Schema Changes"),
    UNKNOWN("Unknown category");

    private final String description;

    DataQualityCategory(final String description) {
        this.description = description;
    }

    private static final Map<String, DataQualityCategory> DICT = Arrays
            .stream(values())
            .collect(Collectors.toMap(DataQualityCategory::name, identity()));

    public static DataQualityCategory resolveByName(final String name) {
        return DICT.getOrDefault(name, UNKNOWN);
    }

    public static DataQualityCategory resolveByDescription(final String name) {
        return Arrays.stream(values())
                .filter(value -> value.getDescription().equals(name))
                .findFirst()
                .orElse(UNKNOWN);
    }
}
