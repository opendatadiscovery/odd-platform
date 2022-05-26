package org.opendatadiscovery.oddplatform.dto.lineage;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.utils.Pair;

public record DataEntityLineageStreamDto(Collection<LineageNodeDto> nodes,
                                         Collection<Pair<Long, Long>> edges,
                                         Collection<DataEntityDimensionsDto> groups,
                                         Map<Long, List<Long>> groupsRelations) {
}
