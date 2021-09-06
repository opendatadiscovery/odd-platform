package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.LabelPojo;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatasetFieldDto {
    private DatasetFieldPojo datasetFieldPojo;
    private List<LabelPojo> labelPojos;
}
