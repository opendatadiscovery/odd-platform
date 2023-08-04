package org.opendatadiscovery.oddplatform.dto;

import java.util.Set;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;

public record DatasetFieldWithLabelsDto(DatasetFieldPojo datasetFieldPojo, Set<LabelPojo> labels) {
}
