package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;

public interface DatasetFieldRepository extends CRUDRepository<DatasetFieldPojo> {
    List<DatasetFieldPojo> persist(final List<DatasetFieldPojo> fields);
}
