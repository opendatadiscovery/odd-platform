package org.opendatadiscovery.oddplatform.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ReferenceTableColumnDto {
    private String name;
    private String defaultValue;
    private LookupTableColumnTypes dataType;
    private boolean isNullable;
    private boolean isUnique;
    private int maxLength;
    private int maxValue;
}
