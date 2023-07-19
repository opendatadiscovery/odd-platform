package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Getter;

import static java.util.function.Function.identity;

public enum DataEntityStatusDto {
    UNASSIGNED(1),
    DRAFT(2),
    STABLE(3),
    DEPRECATED(4),
    DELETED(5);

    @Getter
    private final short id;

    DataEntityStatusDto(final int id) {
        this.id = (short) id;
    }

    private static final Map<Short, DataEntityStatusDto> MAP = Arrays
        .stream(DataEntityStatusDto.values())
        .collect(Collectors.toMap(DataEntityStatusDto::getId, identity()));

    public static Optional<DataEntityStatusDto> findById(final short id) {
        return Optional.ofNullable(MAP.get(id));
    }
}
