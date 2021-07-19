package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTypePojo;
import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetVersionPojo;
import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import com.provectus.oddplatform.model.tables.pojos.TagPojo;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.Collection;
import java.util.List;
import java.util.Set;

@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Data
public class DataEntityDetailsDto extends DataEntityDimensionsDto {
    private Collection<MetadataDto> metadata;
    private Collection<DatasetVersionPojo> datasetVersions;
    private Collection<? extends DataEntityDto> sourceList;
    private Collection<? extends DataEntityDto> targetList;
    private String sourceCodeUrl;

    @Builder(builderMethodName = "detailsBuilder")
    public DataEntityDetailsDto(final DataEntityPojo dataEntity,
                                final Set<DataEntityTypePojo> types,
                                final DataEntitySubtypePojo subtype,
                                final NamespacePojo namespace,
                                final List<OwnershipDto> ownership,
                                final DataSourcePojo dataSource,
                                final Collection<TagPojo> tags,
                                final Collection<DatasetVersionPojo> datasetVersions,
                                final Collection<MetadataDto> metadata,
                                final Collection<DataEntityDto> sourceList,
                                final Collection<DataEntityDto> targetList,
                                final String sourceCodeUrl) {
        super(dataEntity, types, subtype, namespace, ownership, dataSource, tags);
        this.datasetVersions = datasetVersions;
        this.metadata = metadata;
        this.sourceList = sourceList;
        this.targetList = targetList;
        this.sourceCodeUrl = sourceCodeUrl;
    }
}
