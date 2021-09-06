package com.provectus.oddplatform.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Data
@RequiredArgsConstructor
public class DataEntityIngestionDtoSplit {
    private final List<EnrichedDataEntityIngestionDto> newEntities;
    private final List<EnrichedDataEntityIngestionDto> existingEntities;

    public Collection<EnrichedDataEntityIngestionDto> getAllEntities() {
        return Stream.concat(newEntities.stream(), existingEntities.stream()).collect(Collectors.toList());
    }

    public List<Long> getIds() {
        return this.getAllEntities().stream().map(EnrichedDataEntityIngestionDto::getId).collect(Collectors.toList());
    }

    public List<Long> getExistingIds() {
        return this.existingEntities.stream().map(EnrichedDataEntityIngestionDto::getId).collect(Collectors.toList());
    }

    public List<Long> getNewIds() {
        return this.newEntities.stream().map(EnrichedDataEntityIngestionDto::getId).collect(Collectors.toList());
    }
}
