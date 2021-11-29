package org.opendatadiscovery.oddplatform.dto;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTypePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;

@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@NoArgsConstructor
@Data
public class DataEntityDimensionsDto extends DataEntityDto {
    protected NamespacePojo namespace;
    protected List<OwnershipDto> ownership;
    protected DataSourcePojo dataSource;
    protected Collection<TagPojo> tags;

    @Builder(builderMethodName = "dimensionsBuilder")
    public DataEntityDimensionsDto(final DataEntityPojo dataEntity,
                                   final Collection<DataEntityTypePojo> types,
                                   final DataEntitySubtypePojo subtype,
                                   final boolean hasAlerts,
                                   final Map<DataEntityType, DataEntityAttributes> specificAttributes,
                                   final NamespacePojo namespace,
                                   final List<OwnershipDto> ownership,
                                   final DataSourcePojo dataSource,
                                   final Collection<TagPojo> tags) {
        super(dataEntity, types, subtype, hasAlerts, specificAttributes);
        this.namespace = namespace;
        this.ownership = ownership;
        this.dataSource = dataSource;
        this.tags = tags;
    }
}
