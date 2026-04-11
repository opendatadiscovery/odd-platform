package org.opendatadiscovery.oddplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SearchFilterDto {
    private long entityId;
    private String entityName;
    private boolean selected;
    private FacetType type;
}
