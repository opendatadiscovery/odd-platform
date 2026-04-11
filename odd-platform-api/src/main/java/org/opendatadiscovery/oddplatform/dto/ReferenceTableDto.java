package org.opendatadiscovery.oddplatform.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;

@Getter
@Setter
@Builder
public class ReferenceTableDto {
    private String name;
    private String tableName;
    private String tableDescription;
    private NamespacePojo namespacePojo;
}
