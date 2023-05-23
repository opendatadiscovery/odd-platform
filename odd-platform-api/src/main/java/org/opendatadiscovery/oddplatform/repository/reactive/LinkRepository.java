package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.model.tables.pojos.LinkPojo;
import reactor.core.publisher.Flux;

public interface LinkRepository extends ReactiveCRUDRepository<LinkPojo> {
    Flux<LinkPojo> getDataEntityLinks(final long dataEntityId);
}
