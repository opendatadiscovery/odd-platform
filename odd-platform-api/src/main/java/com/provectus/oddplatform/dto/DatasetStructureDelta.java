package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import java.util.List;
import lombok.Data;

@Data
public class DatasetStructureDelta {
    private final List<DatasetFieldPojo> penultimate;
    private final List<DatasetFieldPojo> latest;
}
