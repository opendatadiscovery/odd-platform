package org.opendatadiscovery.oddplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class SearchFilterId {
    private final long entityId;
    private final String name;
}
