package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Getter;

import static java.util.function.Function.identity;

@Getter
public enum DataEntityTaskRunStatusDto {
    SUCCESS(1, "SUCCESS"),
    FAILED(2, "FAILED"),
    SKIPPED(3, "SKIPPED"),
    BROKEN(4, "BROKEN"),
    ABORTED(5, "ABORTED"),
    UNKNOWN(6, "UNKNOWN");

    private final short id;
    private final String status;

    DataEntityTaskRunStatusDto(final int id,
                               final String status) {
        this.id = (short) id;
        this.status = status;
    }

    private static final Map<String, DataEntityTaskRunStatusDto> MAP = Arrays
        .stream(DataEntityTaskRunStatusDto.values())
        .collect(Collectors.toMap(DataEntityTaskRunStatusDto::getStatus, identity()));

    public static Optional<DataEntityTaskRunStatusDto> findByStatus(final String status) {
        return Optional.ofNullable(MAP.get(status));
    }
}
