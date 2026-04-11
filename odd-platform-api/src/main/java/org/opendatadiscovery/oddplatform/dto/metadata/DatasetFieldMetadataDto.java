package org.opendatadiscovery.oddplatform.dto.metadata;

import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldMetadataValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;

public record DatasetFieldMetadataDto(MetadataFieldPojo metadataField, DatasetFieldMetadataValuePojo value) {
}
