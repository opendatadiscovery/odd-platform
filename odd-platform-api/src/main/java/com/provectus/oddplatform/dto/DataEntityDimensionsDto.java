package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTypePojo;
import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import com.provectus.oddplatform.model.tables.pojos.TagPojo;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.Collection;
import java.util.List;

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
                                   final NamespacePojo namespace,
                                   final List<OwnershipDto> ownership,
                                   final DataSourcePojo dataSource,
                                   final Collection<TagPojo> tags) {
        super(dataEntity, types, subtype);
        this.namespace = namespace;
        this.ownership = ownership;
        this.dataSource = dataSource;
        this.tags = tags;
    }
}
