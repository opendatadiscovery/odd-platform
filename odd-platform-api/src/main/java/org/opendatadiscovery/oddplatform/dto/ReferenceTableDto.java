package org.opendatadiscovery.oddplatform.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ReferenceTableDto {
    private String tableName;
    private String tableDescription;
    private String namespace;
}
