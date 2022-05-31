package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveDatasetFieldRepository extends ReactiveCRUDRepository<DatasetFieldPojo> {
    Mono<DatasetFieldPojo> updateDescription(final long datasetFieldId, final String description);

    Flux<DatasetFieldPojo> persist(final List<DatasetFieldPojo> fields);

    Mono<DatasetFieldDto> getDto(final long id);
}
