package org.opendatadiscovery.oddplatform.dto;

import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatasetFieldDto {
    private DatasetFieldPojo datasetFieldPojo;
    private Set<LabelPojo> labelPojos;
    private Long parentFieldId;
    private Integer enumValueCount;
}
