package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import java.util.Set;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetStructurePojo;
import reactor.core.publisher.Mono;

public interface ReactiveDatasetStructureRepository extends ReactiveCRUDRepository<DatasetStructurePojo> {
    Mono<Void> bulkCreateHeadless(final List<DatasetStructurePojo> entities);

    Mono<Void> deleteStructureByVersionIds(final Set<Long> versionsIds);
}
