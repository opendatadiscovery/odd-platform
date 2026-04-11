package org.opendatadiscovery.oddplatform.service.search;

import java.util.UUID;
import org.opendatadiscovery.oddplatform.api.contract.model.CountableSearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.MultipleFacetType;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
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

    Flux<DataEntityRef> getQuerySuggestions(final String query, final Integer entityClassId,
                                            final Boolean manuallyCreated);
}
