package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import reactor.core.publisher.Mono;

public interface DatasetFieldService {
    Mono<DataSetField> updateDatasetField(final long datasetFieldId,
                                          final DatasetFieldUpdateFormData datasetFieldUpdateFormData);
}
