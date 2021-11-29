package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import java.util.List;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;

public interface DatasetFieldMapper {
    DatasetFieldPojo mapField(final DataSetField field);

    List<DatasetFieldPojo> mapFields(final List<DataSetField> fields);
}
