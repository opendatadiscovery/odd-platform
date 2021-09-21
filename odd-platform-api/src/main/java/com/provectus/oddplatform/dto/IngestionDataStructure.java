package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import com.provectus.oddplatform.model.tables.pojos.LineagePojo;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.Builder;
import lombok.Getter;

@Getter
public class IngestionDataStructure {
    private final List<EnrichedDataEntityIngestionDto> newEntities;
    private final List<EnrichedDataEntityIngestionDto> existingEntities;
    private final List<EnrichedDataEntityIngestionDto> allEntities;

    private final List<IngestionTaskRun> taskRuns;
    private final List<LineagePojo> lineageRelations;
    private final List<DataQualityTestRelationsPojo> dataQARelations;

    private final List<Long> existingIds;
    private final List<Long> newIds;
    private final List<Long> allIds;

    @Builder
    public IngestionDataStructure(final List<EnrichedDataEntityIngestionDto> newEntities,
                                  final List<EnrichedDataEntityIngestionDto> existingEntities,
                                  final List<IngestionTaskRun> taskRuns,
                                  final List<LineagePojo> lineageRelations,
                                  final List<DataQualityTestRelationsPojo> dataQARelations) {
        this.newEntities = newEntities;
        this.existingEntities = existingEntities;
        this.allEntities = Stream.concat(newEntities.stream(), existingEntities.stream()).collect(Collectors.toList());

        this.taskRuns = taskRuns;
        this.lineageRelations = lineageRelations;
        this.dataQARelations = dataQARelations;

        this.existingIds = extractIds(existingEntities);
        this.newIds = extractIds(newEntities);
        this.allIds = extractIds(this.allEntities);
    }

    private List<Long> extractIds(final List<EnrichedDataEntityIngestionDto> entities) {
        return entities.stream().map(EnrichedDataEntityIngestionDto::getId).collect(Collectors.toList());
    }
}
