package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Mono;

public interface ReactiveQueryExampleRepository extends ReactiveCRUDRepository<QueryExamplePojo> {
    /**
     * The visible (not soft-deleted) query examples among {@code ids} — ONE query for a whole result page
     * (CTRIB-073 / #1847 ST-13a), the same soft-delete predicate {@link #get(long)} applies.
     */
    Mono<List<QueryExamplePojo>> listByIds(final Collection<Long> ids);

    Mono<Long> countByState(final FacetStateDto state);

    Mono<Page<QueryExampleDto>> findByState(final FacetStateDto state, final int page, final int size);

    Mono<Page<QueryExamplePojo>> listQueryExample(final Integer page, final Integer size, final String inputQuery);
}
