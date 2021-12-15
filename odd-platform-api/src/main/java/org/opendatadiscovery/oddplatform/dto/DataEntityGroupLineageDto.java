package org.opendatadiscovery.oddplatform.dto;

import java.util.List;

public record DataEntityGroupLineageDto(List<DataEntityLineageStreamDto> lineageItems) {
}
