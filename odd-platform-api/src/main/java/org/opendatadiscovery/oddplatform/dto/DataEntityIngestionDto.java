package org.opendatadiscovery.oddplatform.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;

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
    protected Set<DataEntityType> types;
    protected DataEntitySubtype subType;
    protected Map<String, Object> metadata;
    protected String specificAttributesJson;

    protected DataSetIngestionDto dataSet;
    protected DataTransformerIngestionDto dataTransformer;
    protected DataConsumerIngestionDto dataConsumer;
    protected DataQualityTestIngestionDto datasetQualityTest;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DataSetIngestionDto {
        private String parentDatasetOddrn;
        private List<DataSetField> fieldList;
        private String structureHash;
        private Long rowsCount;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DataTransformerIngestionDto {
        private List<String> sourceList;
        private List<String> targetList;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DataConsumerIngestionDto {
        private List<String> inputList;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DataQualityTestIngestionDto {
        private List<String> datasetList;
    }
}
