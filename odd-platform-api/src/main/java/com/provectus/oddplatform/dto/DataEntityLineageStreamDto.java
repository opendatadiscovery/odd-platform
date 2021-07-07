package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.LineagePojo;
import com.provectus.oddplatform.utils.Pair;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collection;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class DataEntityLineageStreamDto {
    private Collection<DataEntityDimensionsDto> nodes;
    private Collection<Pair<Long, Long>> edges;
}
