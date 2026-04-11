package org.opendatadiscovery.oddplatform.dto;

import java.util.Map;

public record DataEntityTotalDelta(Long totalDelta,
                                   Map<Integer, Map<Integer, Long>> entityDelta) {
}
