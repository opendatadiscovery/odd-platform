package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelsResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveLabelService {
    Mono<LabelsResponse> list(final int page, final int size, final String query);

    Flux<Label> bulkUpsert(final List<LabelFormData> labelForms);

    Mono<Label> update(final long id, final LabelFormData form);

    Mono<Label> delete(final long id);
}
