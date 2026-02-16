package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Getter;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;

import static java.util.function.Function.identity;

@Getter
public enum DataEntityQualityStatusDto {
    HEALTHY(1, "HEALTHY",
        List.of(DataEntityRunStatus.SUCCESS),
        List.of(DataEntityRunStatus.SKIPPED, DataEntityRunStatus.ABORTED, DataEntityRunStatus.UNKNOWN,
            DataEntityRunStatus.FAILED, DataEntityRunStatus.BROKEN)),
    ERROR(2, "ERROR",
        List.of(DataEntityRunStatus.FAILED, DataEntityRunStatus.BROKEN),
        List.of()),
    WARNING(3, "WARNING",
        List.of(DataEntityRunStatus.SKIPPED, DataEntityRunStatus.ABORTED, DataEntityRunStatus.UNKNOWN),
        List.of(DataEntityRunStatus.FAILED, DataEntityRunStatus.BROKEN)),
    ALL(4, "ALL", List.of(DataEntityRunStatus.values()), List.of()),
    NOT_MONITORED(5, "NOT_MONITORED", List.of(), List.of(DataEntityRunStatus.values()));

    private final short id;
    private final String status;
    private final List<DataEntityRunStatus> allowedRunStatuses;
    private final List<DataEntityRunStatus> notAllowedRunStatuses;

    DataEntityQualityStatusDto(final int id,
                               final String status,
                               final List<DataEntityRunStatus> allowedRunStatuses,
                               final List<DataEntityRunStatus> notAllowedRunStatuses) {
        this.id = (short) id;
        this.status = status;
        this.allowedRunStatuses = allowedRunStatuses;
        this.notAllowedRunStatuses = notAllowedRunStatuses;
    }

    private static final Map<String, DataEntityQualityStatusDto> MAP = Arrays
        .stream(DataEntityQualityStatusDto.values())
        .collect(Collectors.toMap(DataEntityQualityStatusDto::getStatus, identity()));

    public static Optional<DataEntityQualityStatusDto> findByStatus(final String status) {
        return Optional.ofNullable(MAP.get(status));
    }
}
