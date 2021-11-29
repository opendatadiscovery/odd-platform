package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetStructurePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;

public interface DatasetStructureRepository {
    List<DatasetStructurePojo> bulkCreate(final List<DatasetVersionPojo> versions,
                                          final Map<String, List<DatasetFieldPojo>> datasetFields);
}
