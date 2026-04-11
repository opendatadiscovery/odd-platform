package org.opendatadiscovery.oddplatform.dto.metadata;

import org.opendatadiscovery.oddplatform.api.contract.model.MetadataObject;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;

public record MetadataKey(String fieldName, MetadataTypeEnum fieldType) {
    public MetadataKey(final String fieldName, final String fieldType) {
        this(fieldName, MetadataTypeEnum.valueOf(fieldType));
    }

    public MetadataKey(final MetadataObject metadataObject) {
        this(metadataObject.getName(), metadataObject.getType().name());
    }

    public MetadataKey(final MetadataFieldPojo pojo) {
        this(pojo.getName(), pojo.getType());
    }
}
