package org.opendatadiscovery.oddplatform.dto.lineage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class DataEntityLineageDto {
    private DataEntityDimensionsDto dataEntityDto;
    private DataEntityLineageStreamDto downstream;
    private DataEntityLineageStreamDto upstream;
}
