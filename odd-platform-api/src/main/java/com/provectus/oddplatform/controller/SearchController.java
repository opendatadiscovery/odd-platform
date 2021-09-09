package com.provectus.oddplatform.controller;

import com.provectus.oddplatform.api.contract.api.SearchApi;
import com.provectus.oddplatform.api.contract.model.CountableSearchFilter;
import com.provectus.oddplatform.api.contract.model.DataEntityList;
import com.provectus.oddplatform.api.contract.model.DataEntityRef;
import com.provectus.oddplatform.api.contract.model.MultipleFacetType;
import com.provectus.oddplatform.api.contract.model.SearchFacetsData;
import com.provectus.oddplatform.api.contract.model.SearchFormData;
import com.provectus.oddplatform.service.SearchService;
import java.util.UUID;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequiredArgsConstructor
public class SearchController implements SearchApi {
    private final SearchService searchService;

    @Override
    public Mono<ResponseEntity<Flux<CountableSearchFilter>>> getFiltersForFacet(
        final UUID searchId,
        final MultipleFacetType facetType,
        final Integer page,
        final Integer size,
        final String query,
        final ServerWebExchange exchange
    ) {
        return Mono.just(searchService
                .getFilterOptions(searchId, facetType, page, size, query)
                .subscribeOn(Schedulers.boundedElastic()))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<SearchFacetsData>> getSearchFacetList(final UUID searchId,
                                                                     final ServerWebExchange exchange) {
        return searchService.getFacets(searchId)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataEntityList>> getSearchResults(final UUID searchId,
                                                                 @NotNull @Valid final Integer page,
                                                                 @NotNull @Valid final Integer size,
                                                                 final ServerWebExchange exchange) {
        return searchService
            .getSearchResults(searchId, page, size)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<SearchFacetsData>> search(@Valid final Mono<SearchFormData> searchFormData,
                                                         final ServerWebExchange exchange) {
        return searchFormData
            .publishOn(Schedulers.boundedElastic())
            .flatMap(searchService::search)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<SearchFacetsData>> updateSearchFacets(final UUID searchId,
                                                                     @Valid final Mono<SearchFormData> searchFormData,
                                                                     final ServerWebExchange exchange) {
        return searchFormData
            .publishOn(Schedulers.boundedElastic())
            .flatMap(form -> searchService.updateFacets(searchId, form))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<DataEntityRef>>> getSearchSuggestions(final String query,
                                                                          final ServerWebExchange exchange) {
        return Mono.just(searchService.getQuerySuggestions(query)
                .subscribeOn(Schedulers.boundedElastic()))
            .map(ResponseEntity::ok);
    }
}
