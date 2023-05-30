package org.opendatadiscovery.oddplatform.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.metadata.DatasetFieldMetadataDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatasetFieldDto {
    private DatasetFieldPojo datasetFieldPojo;
    private List<LabelDto> labels;
    private List<DatasetFieldMetadataDto> metadata;
    private List<TermRefDto> terms;
    private Long parentFieldId;
    private Long referenceFieldId;
    private Integer enumValueCount;
}
