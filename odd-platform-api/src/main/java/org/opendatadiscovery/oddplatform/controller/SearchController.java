package org.opendatadiscovery.oddplatform.controller;

import java.util.UUID;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.SearchApi;
import org.opendatadiscovery.oddplatform.api.contract.model.CountableSearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntitySearchHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.MultipleFacetType;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.service.search.DataEntityHighlightService;
import org.opendatadiscovery.oddplatform.service.search.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class SearchController implements SearchApi {
    private final SearchService searchService;
    private final DataEntityHighlightService dataEntityHighlightService;

    @Override
    public Mono<ResponseEntity<Flux<CountableSearchFilter>>> getFiltersForFacet(
        final UUID searchId,
        final MultipleFacetType facetType,
        final Integer page,
        final Integer size,
        final String query,
        final ServerWebExchange exchange
    ) {
        return Mono.just(searchService.getFilterOptions(searchId, facetType, page, size, query))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<SearchFacetsData>> getSearchFacetList(final UUID searchId,
                                                                     final ServerWebExchange exchange) {
        return searchService.getFacets(searchId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntityList>> getSearchResults(final UUID searchId,
                                                                 @NotNull @Valid final Integer page,
                                                                 @NotNull @Valid final Integer size,
                                                                 final ServerWebExchange exchange) {
        return searchService
            .getSearchResults(searchId, page, size)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<SearchFacetsData>> search(@Valid final Mono<SearchFormData> searchFormData,
                                                         final ServerWebExchange exchange) {
        return searchFormData
            .flatMap(searchService::search)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<SearchFacetsData>> updateSearchFacets(final UUID searchId,
                                                                     @Valid final Mono<SearchFormData> searchFormData,
                                                                     final ServerWebExchange exchange) {
        return searchFormData
            .flatMap(form -> searchService.updateFacets(searchId, form))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<DataEntityRef>>> getSearchSuggestions(final String query,
                                                                          final Integer entityClassId,
                                                                          final Boolean manuallyCreated,
                                                                          final ServerWebExchange exchange) {
        return Mono.just(searchService.getQuerySuggestions(query, entityClassId, manuallyCreated))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntitySearchHighlight>> highlightDataEntity(final UUID searchId,
                                                                               final Long dataEntityId,
                                                                               final ServerWebExchange exchange) {
        return dataEntityHighlightService.highlightDataEntity(searchId, dataEntityId)
            .map(ResponseEntity::ok);
    }
}
