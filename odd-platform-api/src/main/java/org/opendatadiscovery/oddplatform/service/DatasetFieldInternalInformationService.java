package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldDescriptionUpdateFormData;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import reactor.core.publisher.Mono;

public interface DatasetFieldInternalInformationService {
    Mono<DatasetFieldPojo> updateDescription(final long datasetFieldId,
                                             final DatasetFieldDescriptionUpdateFormData formData);
}
