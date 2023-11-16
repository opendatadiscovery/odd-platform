package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Mono;

public interface ReactiveQueryExampleSearchEntrypointRepository {
    Mono<Integer> updateQueryExampleVectors(final Long id);

    Mono<Page<QueryExamplePojo>> getQuerySuggestions(final String query);
}
