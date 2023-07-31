package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Getter;

import static java.util.function.Function.identity;

public enum DataEntityStatusDto {
    UNASSIGNED(1, false),
    DRAFT(2, true),
    STABLE(3, false),
    DEPRECATED(4, true),
    DELETED(5, false);

    @Getter
    private final short id;
    @Getter
    private final boolean isSwitchable;

    DataEntityStatusDto(final int id,
                        final boolean isSwitchable) {
        this.id = (short) id;
        this.isSwitchable = isSwitchable;
    }

    private static final Map<Short, DataEntityStatusDto> MAP = Arrays
        .stream(DataEntityStatusDto.values())
        .collect(Collectors.toMap(DataEntityStatusDto::getId, identity()));

    public static Optional<DataEntityStatusDto> findById(final short id) {
        return Optional.ofNullable(MAP.get(id));
    }
}
