package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.DataEntityFilledField;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityFilledPojo;
import reactor.core.publisher.Mono;

public interface ReactiveDataEntityFilledRepository {
    Mono<Long> getFilledDataEntitiesCount();

    Mono<DataEntityFilledPojo> markEntityFilled(final Long dataEntityId,
                                                final DataEntityFilledField dataEntityFilledField);

    Mono<DataEntityFilledPojo> markEntityFilledByDatasetField(final Long datasetFieldId,
                                                              final DataEntityFilledField dataEntityFilledField);

    Mono<DataEntityFilledPojo> markEntityUnfilled(final Long dataEntityId,
                                                  final DataEntityFilledField dataEntityFilledField);

    Mono<DataEntityFilledPojo> markEntityUnfilledByDatasetField(final Long datasetFieldId,
                                                                final DataEntityFilledField dataEntityFilledField);

    Mono<DataEntityFilledPojo> delete(final Long dataEntityId);
}
