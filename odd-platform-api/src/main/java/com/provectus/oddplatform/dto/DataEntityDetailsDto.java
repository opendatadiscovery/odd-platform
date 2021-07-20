package com.provectus.oddplatform.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTypePojo;
import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetVersionPojo;
import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import com.provectus.oddplatform.model.tables.pojos.TagPojo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Data
public class DataEntityDetailsDto extends DataEntityDimensionsDto {
    private Collection<MetadataDto> metadata;

    private DataSetDetailsDto dataSetDetailsDto;
    private DataTransformerDetailsDto dataTransformerDetailsDto;
    private DataQualityTestDetailsDto dataQualityTestDetailsDto;

    @Builder(builderMethodName = "detailsBuilder")
    public DataEntityDetailsDto(final DataEntityPojo dataEntity,
                                final Set<DataEntityTypePojo> types,
                                final DataEntitySubtypePojo subtype,
                                final NamespacePojo namespace,
                                final List<OwnershipDto> ownership,
                                final DataSourcePojo dataSource,
                                final Collection<TagPojo> tags,
                                final Collection<MetadataDto> metadata,
                                final DataSetDetailsDto dataSetDetailsDto,
                                final DataTransformerDetailsDto dataTransformerDetailsDto,
                                final DataQualityTestDetailsDto dataQualityTestDetailsDto) {
        super(dataEntity, types, subtype, namespace, ownership, dataSource, tags);
        this.metadata = metadata;
        this.dataSetDetailsDto = dataSetDetailsDto;
        this.dataTransformerDetailsDto = dataTransformerDetailsDto;
        this.dataQualityTestDetailsDto = dataQualityTestDetailsDto;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataSetDetailsDto {
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
        private Map<String, String> expectationParameters;
    }

    @Data
    @NoArgsConstructor
    public static class DataTransformerAttributes {
        @JsonProperty("source_list")
        private List<String> sourceOddrnList;

        @JsonProperty("target_list")
        private List<String> targetOddrnList;

        @JsonProperty("source_code_url")
        private String sourceCodeUrl;
    }

    @Data
    @NoArgsConstructor
    public static class DataQualityTestAttributes {
        @JsonProperty("suite_name")
        private String suiteName;

        @JsonProperty("suite_url")
        private String suiteUrl;

        @JsonProperty("datasets_list")
        private List<String> datasetOddrnList;

        @JsonProperty("linked_url_list")
        private List<String> linkedUrlList;

        @JsonProperty("expectation")
        private DataQualityTestExpectationAttributes expectation;

        @Data
        @NoArgsConstructor
        public static class DataQualityTestExpectationAttributes {
            @JsonProperty("type")
            private String type;

            private Map<String, String> additionalProperties;
        }
    }
}
