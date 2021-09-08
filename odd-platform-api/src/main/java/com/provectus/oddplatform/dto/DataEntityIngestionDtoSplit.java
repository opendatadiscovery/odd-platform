package com.provectus.oddplatform.dto;

import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Getter
public class DataEntityIngestionDtoSplit {
    private final List<EnrichedDataEntityIngestionDto> newEntities;
    private final List<EnrichedDataEntityIngestionDto> existingEntities;
    private final List<EnrichedDataEntityIngestionDto> allEntities;

    private final List<Long> existingIds;
    private final List<Long> newIds;
    private final List<Long> allIds;

    public DataEntityIngestionDtoSplit(final List<EnrichedDataEntityIngestionDto> newEntities,
                                       final List<EnrichedDataEntityIngestionDto> existingEntities) {
        this.newEntities = newEntities;
        this.existingEntities = existingEntities;
        this.allEntities = Stream.concat(newEntities.stream(), existingEntities.stream()).collect(Collectors.toList());

        this.existingIds = extractIds(existingEntities);
        this.newIds = extractIds(newEntities);
        this.allIds = extractIds(this.allEntities);
    }

    private List<Long> extractIds(final List<EnrichedDataEntityIngestionDto> entities) {
        return entities.stream().map(EnrichedDataEntityIngestionDto::getId).collect(Collectors.toList());
    }
}
