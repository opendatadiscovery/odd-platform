package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetVersionPojo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HowToCallThat {
    private DatasetVersionPojo datasetVersion;
    private List<DatasetFieldPojo> datasetFields;
}
