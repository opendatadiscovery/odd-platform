package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import java.util.List;

public interface DatasetFieldRepository extends CRUDRepository<DatasetFieldPojo> {
    void setDescription(final long datasetFieldId, final String description);

    List<DatasetFieldPojo> persist(final List<DatasetFieldPojo> fields);
}
