package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.ingestion.contract.model.DataSetField;
import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;

import java.util.List;

public interface DatasetFieldMapper {
    List<DatasetFieldPojo> mapStructure(final List<DataSetField> fields, final long datasetVersionId);

    DatasetFieldPojo mapStructure(final DataSetField field, final long datasetVersionId);
}
