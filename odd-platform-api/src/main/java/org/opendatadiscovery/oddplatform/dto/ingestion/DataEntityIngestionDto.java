package org.opendatadiscovery.oddplatform.dto.ingestion;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DataEntityIngestionDto {
    protected String name;
    protected String oddrn;
    protected long dataSourceId;
    protected String externalDescription;
    protected OffsetDateTime createdAt;
    protected OffsetDateTime updatedAt;
    protected Set<DataEntityClassDto> entityClasses;
    protected DataEntityTypeDto type;
    protected Map<String, Object> metadata;
    protected List<String> tags;
    protected String specificAttributesJson;

    protected DataSetIngestionDto dataSet;
    protected DataTransformerIngestionDto dataTransformer;
    protected DataConsumerIngestionDto dataConsumer;
    protected DataQualityTestIngestionDto datasetQualityTest;
    protected DataInputIngestionDto dataInput;
    protected DataEntityGroupDto dataEntityGroup;

    public record DataSetIngestionDto(String parentDatasetOddrn,
                                      List<DatasetFieldIngestionDto> fieldList,
                                      String structureHash,
                                      Long rowsCount) {
    }

    public record DataTransformerIngestionDto(List<String> sourceList, List<String> targetList) {
    }

    public record DataConsumerIngestionDto(List<String> inputList) {
    }

    public record DataQualityTestIngestionDto(List<String> datasetList) {
    }

    public record DataInputIngestionDto(List<String> outputs) {
    }

    public record DataEntityGroupDto(List<String> entitiesOddrns, String groupOddrn) {
    }

    public record DatasetFieldIngestionDto(DatasetFieldPojo field, List<String> labels) {
    }
}
