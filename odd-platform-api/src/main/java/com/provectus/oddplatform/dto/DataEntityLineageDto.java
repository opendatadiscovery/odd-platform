package com.provectus.oddplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class DataEntityLineageDto {
    private DataEntityDimensionsDto dataEntityDto;
    private DataEntityLineageStreamDto downstream;
    private DataEntityLineageStreamDto upstream;
}
