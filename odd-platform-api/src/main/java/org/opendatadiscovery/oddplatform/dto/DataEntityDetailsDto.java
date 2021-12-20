package org.opendatadiscovery.oddplatform.dto;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.opendatadiscovery.oddplatform.dto.attributes.DataEntityAttributes;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
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
                                final boolean hasAlerts,
                                final Map<DataEntityTypeDto, DataEntityAttributes> specificAttributes,
                                final NamespacePojo namespace,
                                final List<OwnershipDto> ownership,
                                final DataSourcePojo dataSource,
                                final Collection<TagPojo> tags,
                                final Collection<MetadataDto> metadata,
                                final DataEntityGroupDimensionsDto dataEntityGroupDimensionsDto,
                                final DataSetDetailsDto dataSetDetailsDto,
                                final DataTransformerDetailsDto dataTransformerDetailsDto,
                                final DataConsumerDetailsDto dataConsumerDetailsDto,
                                final DataQualityTestDetailsDto dataQualityTestDetailsDto,
                                final DataInputDetailsDto dataInputDetailsDto) {
        super(dataEntity, hasAlerts, specificAttributes, namespace, ownership,
            dataSource, tags, dataEntityGroupDimensionsDto);

        this.metadata = metadata;
        this.dataSetDetailsDto = dataSetDetailsDto;
        this.dataTransformerDetailsDto = dataTransformerDetailsDto;
        this.dataConsumerDetailsDto = dataConsumerDetailsDto;
        this.dataQualityTestDetailsDto = dataQualityTestDetailsDto;
        this.dataInputDetailsDto = dataInputDetailsDto;
    }

    public record DataSetDetailsDto(Long rowsCount,
                                    Long fieldsCount,
                                    Long consumersCount,
                                    Collection<DatasetVersionPojo> datasetVersions) {
        public DataSetDetailsDto(final Collection<DatasetVersionPojo> datasetVersions) {
            this(null, null, null, datasetVersions);
        }
    }

    public record DataTransformerDetailsDto(Collection<? extends DataEntityDto> sourceList,
                                            Collection<? extends DataEntityDto> targetList,
                                            String sourceCodeUrl) {}

    public record DataQualityTestDetailsDto(String suiteName,
                                            String suiteUrl,
                                            Collection<? extends DataEntityDto> datasetList,
                                            List<String> linkedUrlList,
                                            String expectationType,
                                            DataEntityTaskRunPojo latestTaskRun,
                                            Map<String, String> expectationParameters) {}

    public record DataConsumerDetailsDto(Collection<? extends DataEntityDto> inputList) {}

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataInputDetailsDto {
        private Collection<? extends DataEntityDto> outputList;
    }
}
