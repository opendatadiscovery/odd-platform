package org.opendatadiscovery.oddplatform.dto.lineage;

import java.util.List;

public record DataEntityGroupLineageDto(List<DataEntityLineageStreamDto> lineageItems) {
}
