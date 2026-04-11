package org.opendatadiscovery.oddplatform.service;

import java.util.UUID;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleList;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleRefList;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleSearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleSearchFormData;
import reactor.core.publisher.Mono;

public interface QueryExampleSearchService {
    Mono<QueryExampleRefList> getQuerySuggestions(final String query);

    Mono<QueryExampleSearchFacetsData> search(final QueryExampleSearchFormData searchFormData);

    Mono<QueryExampleSearchFacetsData> getFacets(final UUID searchId);

    Mono<QueryExampleList> getSearchResults(final UUID searchId, final Integer page, final Integer size);

    Mono<QueryExampleSearchFacetsData> updateFacets(final UUID searchId, final QueryExampleSearchFormData fd);
}
