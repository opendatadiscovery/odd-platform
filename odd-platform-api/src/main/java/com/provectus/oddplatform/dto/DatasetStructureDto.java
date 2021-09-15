package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.DatasetVersionPojo;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatasetStructureDto {
    private DatasetVersionPojo datasetVersion;
    private List<DatasetFieldDto> datasetFields;
}
