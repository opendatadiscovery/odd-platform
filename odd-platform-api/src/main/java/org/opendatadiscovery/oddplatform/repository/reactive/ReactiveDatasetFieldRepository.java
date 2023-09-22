package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldWithLabelsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveDatasetFieldRepository extends ReactiveCRUDRepository<DatasetFieldPojo> {
    Mono<DatasetFieldPojo> updateDescription(final long datasetFieldId, final String description);

    Mono<DatasetFieldPojo> updateInternalName(final long datasetFieldId, final String internalName);

    Mono<DatasetFieldWithLabelsDto> getDatasetFieldWithTags(final long datasetFieldId);

    Flux<DatasetFieldPojo> getLastVersionDatasetFieldsByOddrns(final List<String> oddrns);

    Mono<Long> getDataEntityIdByDatasetFieldId(final long datasetFieldId);
}
