package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetStructurePojo;
import reactor.core.publisher.Mono;

public interface ReactiveDatasetStructureRepository extends ReactiveCRUDRepository<DatasetStructurePojo> {
    // TODO: rename
    Mono<Void> bulkCreateHeadless(final List<DatasetStructurePojo> entities);
}
