package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.ingestion.contract.model.DataSetField;
import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;

import java.util.List;

public interface DatasetFieldMapper {
    List<DatasetFieldPojo> toPojo(final List<DataSetField> fields, final long datasetVersionId);

    DatasetFieldPojo toPojo(final DataSetField field, final long datasetVersionId);
}
