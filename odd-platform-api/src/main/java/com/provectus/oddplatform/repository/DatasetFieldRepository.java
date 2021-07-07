package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;

public interface DatasetFieldRepository extends CRUDRepository<DatasetFieldPojo> {
    void setDescription(final long datasetFieldId, final String description);
}
