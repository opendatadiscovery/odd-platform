package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.utils.Pair;
import java.util.Collection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class DataEntityLineageStreamDto {
    private Collection<DataEntityDimensionsDto> nodes;
    private Collection<Pair<Long, Long>> edges;
}
