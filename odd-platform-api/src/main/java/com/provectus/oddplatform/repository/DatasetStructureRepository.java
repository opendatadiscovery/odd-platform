package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetStructurePojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetVersionPojo;
import java.util.List;
import java.util.Map;

public interface DatasetStructureRepository {
    List<DatasetStructurePojo> bulkCreate(final List<DatasetVersionPojo> versions,
                                          final Map<String, List<DatasetFieldPojo>> datasetFields);
}
