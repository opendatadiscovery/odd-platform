package org.opendatadiscovery.oddplatform.dto;

import java.util.List;
import lombok.Data;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;

@Data
public class DatasetStructureDelta {
    private final List<DatasetFieldPojo> penultimate;
    private final List<DatasetFieldPojo> latest;
}
