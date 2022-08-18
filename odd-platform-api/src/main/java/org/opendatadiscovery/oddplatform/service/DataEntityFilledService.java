package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.dto.DataEntityFilledField;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityFilledPojo;
import reactor.core.publisher.Mono;

public interface DataEntityFilledService {
    Mono<Long> getFilledDataEntitiesCount();

    Mono<DataEntityFilledPojo> markEntityFilled(final Long dataEntityId,
                                                final DataEntityFilledField dataEntityFilledField);

    Mono<DataEntityFilledPojo> markEntityFilledByDatasetFieldId(final Long datasetFieldId,
                                                                final DataEntityFilledField dataEntityFilledField);

    Mono<DataEntityFilledPojo> markEntityUnfilled(final Long dataEntityId,
                                                  final DataEntityFilledField dataEntityFilledField);

    Mono<DataEntityFilledPojo> markEntityUnfilledByDatasetFieldId(final Long datasetFieldId,
                                                                  final DataEntityFilledField dataEntityFilledField);
}
