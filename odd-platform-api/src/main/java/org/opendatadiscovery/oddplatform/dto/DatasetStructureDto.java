package org.opendatadiscovery.oddplatform.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatasetStructureDto {
    private DatasetVersionPojo datasetVersion;
    private List<DatasetFieldDto> datasetFields;
}
