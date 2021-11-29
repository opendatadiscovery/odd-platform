package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;

public interface DatasetFieldMapper {
    DatasetFieldPojo mapField(final DataSetField field);

    List<DatasetFieldPojo> mapFields(final List<DataSetField> fields);
}
