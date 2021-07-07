package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.DatasetFieldLabelsFormData;
import com.provectus.oddplatform.api.contract.model.InternalDescription;
import com.provectus.oddplatform.api.contract.model.InternalDescriptionFormData;
import com.provectus.oddplatform.api.contract.model.Label;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


public interface DatasetFieldService {
    Mono<InternalDescription> upsertDescription(final long datasetFieldId, final InternalDescriptionFormData form);

    Flux<Label> upsertLabels(final long datasetFieldId, final DatasetFieldLabelsFormData formData);
}
