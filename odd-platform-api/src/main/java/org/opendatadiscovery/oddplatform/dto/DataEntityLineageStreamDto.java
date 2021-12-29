package org.opendatadiscovery.oddplatform.dto;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.opendatadiscovery.oddplatform.utils.Pair;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class DataEntityLineageStreamDto {
    private Collection<DataEntityDimensionsDto> nodes;
    private Collection<Pair<Long, Long>> edges;
    private Collection<DataEntityDimensionsDto> groups;
    private Map<Long, List<Long>> groupsRelations;
}
