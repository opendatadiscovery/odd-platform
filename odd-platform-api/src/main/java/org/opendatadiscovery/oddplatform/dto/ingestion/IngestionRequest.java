package org.opendatadiscovery.oddplatform.dto.ingestion;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.Builder;
import lombok.Getter;
import org.apache.commons.collections4.ListUtils;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassesTotalDelta;
import org.opendatadiscovery.oddplatform.dto.DataEntitySpecificAttributesDelta;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupEntityRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupParentGroupRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;

@Getter
public class IngestionRequest {
    private final List<EnrichedDataEntityIngestionDto> newEntities;
    private final List<EnrichedDataEntityIngestionDto> existingEntities;
    private final List<EnrichedDataEntityIngestionDto> allEntities;
    private final DataEntityClassesTotalDelta entityClassesTotalDelta;

    private final List<IngestionTaskRun> taskRuns;
    private final List<LineagePojo> lineageRelations;
    private final List<DataQualityTestRelationsPojo> dataQARelations;
    private final List<GroupEntityRelationsPojo> groupEntityRelations;
    private final List<GroupParentGroupRelationsPojo> groupParentGroupRelations;
    private final List<DataEntitySpecificAttributesDelta> specificAttributesDeltas;

    private final List<Long> existingIds;
    private final List<Long> newIds;
    private final List<Long> allIds;

    @Builder
    public IngestionRequest(final List<EnrichedDataEntityIngestionDto> newEntities,
                            final List<EnrichedDataEntityIngestionDto> existingEntities,
                            final List<IngestionTaskRun> taskRuns,
                            final List<LineagePojo> lineageRelations,
                            final List<DataQualityTestRelationsPojo> dataQARelations,
                            final List<DataEntitySpecificAttributesDelta> specificAttributesDeltas,
                            final List<GroupEntityRelationsPojo> groupEntityRelations,
                            final List<GroupParentGroupRelationsPojo> groupParentGroupRelations,
                            final DataEntityClassesTotalDelta entityClassesTotalDelta) {
        this.newEntities = newEntities;
        this.existingEntities = existingEntities;
        this.allEntities = Stream.concat(newEntities.stream(), existingEntities.stream()).collect(Collectors.toList());

        this.taskRuns = taskRuns;
        this.lineageRelations = lineageRelations;
        this.dataQARelations = dataQARelations;
        this.specificAttributesDeltas = specificAttributesDeltas;
        this.groupEntityRelations = groupEntityRelations;
        this.groupParentGroupRelations = groupParentGroupRelations;
        this.entityClassesTotalDelta = entityClassesTotalDelta;

        this.existingIds = extractIds(existingEntities);
        this.newIds = extractIds(newEntities);
        this.allIds = ListUtils.union(this.existingIds, this.newIds);
    }

    private List<Long> extractIds(final List<EnrichedDataEntityIngestionDto> entities) {
        return entities.stream().map(EnrichedDataEntityIngestionDto::getId).collect(Collectors.toList());
    }
}
