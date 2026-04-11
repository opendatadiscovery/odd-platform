package org.opendatadiscovery.oddplatform.dto.dataset;

import java.util.Set;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;

public record DatasetVersionFields(DatasetVersionPojo versionPojo, Set<DatasetFieldPojo> fields) {
}
