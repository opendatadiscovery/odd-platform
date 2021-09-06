package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.LabelPojo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatasetFieldDto {
    private DatasetFieldPojo datasetFieldPojo;
    private Set<LabelPojo> labelPojos;
}
