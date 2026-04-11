package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Mono;

public interface ReactiveQueryExampleRepository extends ReactiveCRUDRepository<QueryExamplePojo> {
    Mono<Long> countByState(final FacetStateDto state);

    Mono<Page<QueryExampleDto>> findByState(final FacetStateDto state, final int page, final int size);

    Mono<Page<QueryExamplePojo>> listQueryExample(final Integer page, final Integer size, final String inputQuery);
}
