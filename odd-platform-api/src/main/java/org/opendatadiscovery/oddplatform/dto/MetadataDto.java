package org.opendatadiscovery.oddplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MetadataDto {
    private MetadataFieldPojo metadataField;
    private MetadataFieldValuePojo metadataFieldValue;
}
