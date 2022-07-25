package org.opendatadiscovery.oddplatform.dto;

import java.util.Map;

public record DataEntityClassesTotalDelta(Long totalDelta,
                                          Map<DataEntityClassDto, Long> entityClassesDelta) {
}
