package org.opendatadiscovery.oddplatform.dto.lineage;

import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;

public record LineageNodeDto(DataEntityDimensionsDto entity, Integer childrenCount, Integer parentsCount) {
}
