package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Map;
import java.util.UUID;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.SearchFilterId;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;
import reactor.core.publisher.Mono;

public interface ReactiveSearchFacetRepository {

    Mono<SearchFacetsPojo> create(final SearchFacetsPojo pojo);

    Mono<SearchFacetsPojo> update(final SearchFacetsPojo pojo);

    Mono<SearchFacetsPojo> get(final UUID id);

    Mono<Map<SearchFilterId, Long>> getTagFacetForTerms(final String facetQuery,
                                                        final int page,
                                                        final int size,
                                                        final FacetStateDto state);

    Mono<Map<SearchFilterId, Long>> getOwnerFacetForTerms(final String facetQuery,
                                                          final int page,
                                                          final int size,
                                                          final FacetStateDto state);
}
