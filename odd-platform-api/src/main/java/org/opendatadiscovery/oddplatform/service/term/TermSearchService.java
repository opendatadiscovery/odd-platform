package org.opendatadiscovery.oddplatform.service.term;

import java.util.UUID;
import org.opendatadiscovery.oddplatform.api.contract.model.CountableSearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.MultipleFacetType;
import org.opendatadiscovery.oddplatform.api.contract.model.TermList;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRefList;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchFormData;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface TermSearchService {
    Flux<CountableSearchFilter> getFilterOptions(final UUID searchId,
                                                 final MultipleFacetType facetType,
                                                 final Integer page,
                                                 final Integer size,
                                                 final String query);

    Mono<TermSearchFacetsData> getFacets(final UUID searchId);

    Mono<TermSearchFacetsData> search(final TermSearchFormData searchFormData);

    Mono<TermSearchFacetsData> updateFacets(final UUID searchId, final TermSearchFormData formData);

    Mono<TermRefList> getQuerySuggestions(final String query);

    Mono<TermList> getSearchResults(final UUID searchId, final Integer page, final Integer size);
}
