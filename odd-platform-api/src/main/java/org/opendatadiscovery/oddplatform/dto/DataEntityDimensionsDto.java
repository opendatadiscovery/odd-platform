package org.opendatadiscovery.oddplatform.dto;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.opendatadiscovery.oddplatform.dto.attributes.DataEntityAttributes;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;

@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@NoArgsConstructor
@Data
public class DataEntityDimensionsDto extends DataEntityDto {
    protected Map<DataEntityClassDto, DataEntityAttributes> specificAttributes;
    protected NamespacePojo namespace;
    protected List<OwnershipDto> ownership;
    protected DataSourcePojo dataSource;

    protected Collection<DataEntityPojo> parentGroups;
    protected DataEntityGroupDimensionsDto groupsDto;
    protected DataSetDetailsDto dataSetDetailsDto;
    protected DataTransformerDetailsDto dataTransformerDetailsDto;
    protected DataConsumerDetailsDto dataConsumerDetailsDto;
    protected DataQualityTestDetailsDto dataQualityTestDetailsDto;
    protected DataInputDetailsDto dataInputDetailsDto;

    @Builder(builderMethodName = "dimensionsBuilder")
    public DataEntityDimensionsDto(final DataEntityPojo dataEntity,
                                   final boolean hasAlerts,
                                   final Map<DataEntityClassDto, DataEntityAttributes> specificAttributes,
                                   final NamespacePojo namespace,
                                   final List<OwnershipDto> ownership,
                                   final DataSourcePojo dataSource) {
        super(dataEntity, hasAlerts);
        this.specificAttributes = specificAttributes;
        this.namespace = namespace;
        this.ownership = ownership;
        this.dataSource = dataSource;
    }

    public record DataEntityGroupDimensionsDto(Collection<DataEntityPojo> entities,
                                               int itemsCount,
                                               boolean hasChildren) {
    }

    public record DataSetDetailsDto(Long rowsCount,
                                    Long fieldsCount,
                                    Long consumersCount) {
    }

    public record DataTransformerDetailsDto(Collection<DataEntityPojo> sourceList,
                                            Collection<DataEntityPojo> targetList,
                                            String sourceCodeUrl) {
    }

    public record DataQualityTestDetailsDto(String suiteName,
                                            String suiteUrl,
                                            Collection<DataEntityPojo> datasetList,
                                            List<String> linkedUrlList,
                                            String expectationType,
                                            DataEntityTaskRunPojo latestTaskRun,
                                            Map<String, String> expectationParameters) {
    }

    public record DataConsumerDetailsDto(Collection<DataEntityPojo> inputList) {
    }

    public record DataInputDetailsDto(Collection<DataEntityPojo> outputList) {
    }
}
