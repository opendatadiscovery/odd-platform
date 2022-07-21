package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityFilledPojo;
import reactor.core.publisher.Mono;

public interface ReactiveDataEntityFilledRepository {
    Mono<Long> getFilledDataEntitiesCount();

    Mono<DataEntityFilledPojo> markEntityFilled(final Long dataEntityId);

    Mono<DataEntityFilledPojo> markEntityFilledByDatasetField(final Long datasetFieldId);

    Mono<DataEntityFilledPojo> markEntityUnfilled(final Long dataEntityId);
}
