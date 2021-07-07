package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.DatasetRevisionPojo;

import java.util.List;

public interface DatasetRevisionRepository extends CRUDRepository<DatasetRevisionPojo> {
    List<DatasetRevisionPojo> listLatestByDatasetIds(final List<Long> datasetIds);
}
