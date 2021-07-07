package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.LineagePojo;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Data
@RequiredArgsConstructor
public class DataEntityIngestionDtoSplit {
    private final List<DataEntityIngestionDto> newEntities;
    private final List<DataEntityIngestionDto> existingEntities;
    private final List<LineagePojo> lineageRelations;
    private final Set<String> hollowOddrns;

    public List<DataEntityIngestionDto> getAllEntities() {
        return Stream.concat(newEntities.stream(), existingEntities.stream()).collect(Collectors.toList());
    }
}
