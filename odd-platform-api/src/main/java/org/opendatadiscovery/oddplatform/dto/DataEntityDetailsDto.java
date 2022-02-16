package org.opendatadiscovery.oddplatform.dto;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.opendatadiscovery.oddplatform.dto.attributes.DataEntityAttributes;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;

@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Data
public class DataEntityDetailsDto extends DataEntityDimensionsDto {
    private Collection<MetadataDto> metadata;
    private Collection<DatasetVersionPojo> datasetVersions;

    @Builder(builderMethodName = "detailsBuilder")
    public DataEntityDetailsDto(final DataEntityPojo dataEntity,
                                final boolean hasAlerts,
                                final Map<DataEntityTypeDto, DataEntityAttributes> specificAttributes,
                                final NamespacePojo namespace,
                                final List<OwnershipDto> ownership,
                                final DataSourcePojo dataSource,
                                final Collection<TagPojo> tags,
                                final Collection<MetadataDto> metadata,
                                final Collection<DatasetVersionPojo> datasetVersions,
                                final DataEntityGroupDimensionsDto dataEntityGroupDimensionsDto,
                                final DataSetDetailsDto dataSetDetailsDto,
                                final DataTransformerDetailsDto dataTransformerDetailsDto,
                                final DataConsumerDetailsDto dataConsumerDetailsDto,
                                final DataQualityTestDetailsDto dataQualityTestDetailsDto,
                                final DataInputDetailsDto dataInputDetailsDto) {
        super(dataEntity, hasAlerts, specificAttributes, namespace, ownership,
            dataSource, tags, dataEntityGroupDimensionsDto, dataSetDetailsDto, dataTransformerDetailsDto,
            dataConsumerDetailsDto, dataQualityTestDetailsDto, dataInputDetailsDto);

        this.metadata = metadata;
        this.datasetVersions = datasetVersions;
    }
}
