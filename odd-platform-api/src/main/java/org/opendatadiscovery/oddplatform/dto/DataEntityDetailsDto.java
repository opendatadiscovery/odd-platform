package org.opendatadiscovery.oddplatform.dto;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.opendatadiscovery.oddplatform.dto.attributes.DataEntityAttributes;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;

@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Data
public class DataEntityDetailsDto extends DataEntityDimensionsDto {
    private Collection<MetadataDto> metadata;
    private Collection<DatasetVersionPojo> datasetVersions;
    private Collection<TermRefDto> terms;

    @Builder(builderMethodName = "detailsBuilder")
    public DataEntityDetailsDto(final DataEntityPojo dataEntity,
                                final boolean hasAlerts,
                                final Map<DataEntityClassDto, DataEntityAttributes> specificAttributes,
                                final NamespacePojo namespace,
                                final List<OwnershipDto> ownership,
                                final DataSourcePojo dataSource,
                                final Collection<TagDto> tags) {
        super(dataEntity, hasAlerts, specificAttributes, namespace, ownership, dataSource, tags);
    }
}
