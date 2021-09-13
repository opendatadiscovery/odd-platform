package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.CountableSearchFilter;
import com.provectus.oddplatform.api.contract.model.DataEntityList;
import com.provectus.oddplatform.api.contract.model.DataEntityRef;
import com.provectus.oddplatform.api.contract.model.MultipleFacetType;
import com.provectus.oddplatform.api.contract.model.SearchFacetsData;
import com.provectus.oddplatform.api.contract.model.SearchFormData;
import java.util.UUID;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface SearchService {
    Flux<CountableSearchFilter> getFilterOptions(final UUID searchId,
                                                 final MultipleFacetType facetType,
                                                 final Integer page,
                                                 final Integer size,
                                                 final String query);

    Mono<SearchFacetsData> getFacets(final UUID searchId);

    Mono<SearchFacetsData> search(final SearchFormData formData);

    Mono<SearchFacetsData> updateFacets(final UUID searchId, final SearchFormData formData);

    Mono<DataEntityList> getSearchResults(final UUID searchId, final Integer page, final Integer size);

    Flux<DataEntityRef> getQuerySuggestions(final String query);
}
