package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelsResponse;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveLabelService {
    Mono<LabelsResponse> list(final int page, final int size, final String query);

    Flux<LabelPojo> getOrCreateLabelsByName(final Set<String> labelNames);

    Flux<Label> bulkUpsert(final List<LabelFormData> labelForms);

    Mono<Label> update(final long id, final LabelFormData form);

    Mono<Label> delete(final long id);
}
