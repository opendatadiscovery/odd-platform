package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveDatasetFieldRepository extends ReactiveCRUDRepository<DatasetFieldPojo> {
    Mono<DatasetFieldPojo> updateDescription(final long datasetFieldId, final String description);

    Mono<DatasetFieldDto> getDto(final long datasetFieldId);

    Mono<Map<String, DatasetFieldPojo>> getExistingFieldsByOddrnAndType(final List<DatasetFieldPojo> fields);

    Flux<DatasetFieldPojo> getExistingFieldsByOddrn(final Collection<String> oddrns);

    Mono<Long> getDataEntityIdByDatasetFieldId(final long datasetFieldId);
}
