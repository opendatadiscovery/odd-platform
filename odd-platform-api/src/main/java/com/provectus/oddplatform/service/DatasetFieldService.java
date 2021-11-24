package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.DataSetField;
import com.provectus.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import reactor.core.publisher.Mono;

public interface DatasetFieldService {
    Mono<DataSetField> updateDatasetField(final long datasetFieldId,
                                          final DatasetFieldUpdateFormData datasetFieldUpdateFormData);
}
