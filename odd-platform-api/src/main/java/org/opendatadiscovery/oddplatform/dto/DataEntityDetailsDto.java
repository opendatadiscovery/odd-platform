package org.opendatadiscovery.oddplatform.dto;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTypePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;

@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Data
public class DataEntityDetailsDto extends DataEntityDimensionsDto {
    private Collection<MetadataDto> metadata;

    private DataSetDetailsDto dataSetDetailsDto;
    private DataTransformerDetailsDto dataTransformerDetailsDto;
    private DataConsumerDetailsDto dataConsumerDetailsDto;
    private DataQualityTestDetailsDto dataQualityTestDetailsDto;
    private DataInputDetailsDto dataInputDetailsDto;

    @Builder(builderMethodName = "detailsBuilder")
    public DataEntityDetailsDto(final DataEntityPojo dataEntity,
                                final Set<DataEntityTypePojo> types,
                                final DataEntitySubtypePojo subtype,
                                final boolean hasAlerts,
                                final Map<DataEntityType, DataEntityAttributes> specificAttributes,
                                final NamespacePojo namespace,
                                final List<OwnershipDto> ownership,
                                final DataSourcePojo dataSource,
                                final Collection<TagPojo> tags,
                                final Collection<MetadataDto> metadata,
                                final DataSetDetailsDto dataSetDetailsDto,
                                final DataTransformerDetailsDto dataTransformerDetailsDto,
                                final DataConsumerDetailsDto dataConsumerDetailsDto,
                                final DataQualityTestDetailsDto dataQualityTestDetailsDto,
                                final DataInputDetailsDto dataInputDetailsDto) {
        super(dataEntity, types, subtype, hasAlerts, specificAttributes, namespace, ownership, dataSource, tags);
        this.metadata = metadata;
        this.dataSetDetailsDto = dataSetDetailsDto;
        this.dataTransformerDetailsDto = dataTransformerDetailsDto;
        this.dataConsumerDetailsDto = dataConsumerDetailsDto;
        this.dataQualityTestDetailsDto = dataQualityTestDetailsDto;
        this.dataInputDetailsDto = dataInputDetailsDto;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataSetDetailsDto {
        private Long rowsCount;
        private Long fieldsCount;
        private Long consumersCount;
        private Collection<DatasetVersionPojo> datasetVersions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataTransformerDetailsDto {
        private Collection<? extends DataEntityDto> sourceList;
        private Collection<? extends DataEntityDto> targetList;
        private String sourceCodeUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataQualityTestDetailsDto {
        private String suiteName;
        private String suiteUrl;
        private Collection<? extends DataEntityDto> datasetList;
        private List<String> linkedUrlList;
        private String expectationType;
        private DataEntityTaskRunPojo latestTaskRun;
        private Map<String, String> expectationParameters;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataConsumerDetailsDto {
        private Collection<? extends DataEntityDto> inputList;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataInputDetailsDto {
        private Collection<? extends DataEntityDto> outputList;
    }
}
