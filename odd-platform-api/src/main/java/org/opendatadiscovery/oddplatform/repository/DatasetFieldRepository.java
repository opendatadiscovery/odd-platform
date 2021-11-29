package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;

public interface DatasetFieldRepository extends CRUDRepository<DatasetFieldPojo> {
    void setDescription(final long datasetFieldId, final String description);

    List<DatasetFieldPojo> persist(final List<DatasetFieldPojo> fields);

    void updateSearchVectors(final long datasetFieldId);

    DatasetFieldDto updateDatasetField(final long datasetFieldId,
                                       final DatasetFieldUpdateFormData datasetFieldUpdateFormData);

    DatasetFieldDto getDto(final long id);
}
