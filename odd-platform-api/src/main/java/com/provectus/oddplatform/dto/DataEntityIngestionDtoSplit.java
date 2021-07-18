package com.provectus.oddplatform.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Data
@RequiredArgsConstructor
public class DataEntityIngestionDtoSplit {
    private final List<EnrichedDataEntityIngestionDto> newEntities;
    private final List<EnrichedDataEntityIngestionDto> existingEntities;

    public List<EnrichedDataEntityIngestionDto> getAllEntities() {
        return Stream.concat(newEntities.stream(), existingEntities.stream()).collect(Collectors.toList());
    }
}
