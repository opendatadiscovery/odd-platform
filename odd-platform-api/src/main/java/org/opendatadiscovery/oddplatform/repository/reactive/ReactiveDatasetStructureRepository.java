package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetStructurePojo;
import reactor.core.publisher.Mono;

public interface ReactiveDatasetStructureRepository {
    Mono<List<DatasetStructurePojo>> bulkCreate(final List<DatasetStructurePojo> entities);
}
