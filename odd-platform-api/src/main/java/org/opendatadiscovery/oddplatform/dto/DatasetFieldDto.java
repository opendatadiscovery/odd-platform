package org.opendatadiscovery.oddplatform.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.metadata.DatasetFieldMetadataDto;
import org.opendatadiscovery.oddplatform.dto.term.LinkedTermDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatasetFieldDto {
    private DatasetFieldPojo datasetFieldPojo;
    private List<TagDto> tags;
    private List<DatasetFieldMetadataDto> metadata;
    private List<LinkedTermDto> terms;
    private Long parentFieldId;
    private Long referenceFieldId;
    private Integer enumValueCount;
}
