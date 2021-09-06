package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.ingestion.contract.model.DataSetField;
import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;

import java.util.List;

public interface DatasetFieldMapper {
    DatasetFieldPojo mapField(final DataSetField field);

    List<DatasetFieldPojo> mapFields(final List<DataSetField> fields);
}
