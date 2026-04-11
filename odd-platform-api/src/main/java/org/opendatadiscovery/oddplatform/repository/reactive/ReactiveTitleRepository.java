package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import reactor.core.publisher.Mono;

public interface ReactiveTitleRepository extends ReactiveCRUDRepository<TitlePojo> {

    Mono<TitlePojo> getByName(final String name);
}
