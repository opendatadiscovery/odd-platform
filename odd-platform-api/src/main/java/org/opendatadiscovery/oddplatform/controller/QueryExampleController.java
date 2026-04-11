package org.opendatadiscovery.oddplatform.controller;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.QueryExampleApi;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleList;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleRefList;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleSearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleSearchFormData;
import org.opendatadiscovery.oddplatform.service.QueryExampleSearchService;
import org.opendatadiscovery.oddplatform.service.QueryExampleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class QueryExampleController implements QueryExampleApi {
    private final QueryExampleService queryExampleService;
    private final QueryExampleSearchService queryExampleSearchService;

    @Override
    public Mono<ResponseEntity<QueryExampleDetails>> createQueryExamples(
        final Mono<QueryExampleFormData> queryExampleFormData,
        final ServerWebExchange exchange) {
        return queryExampleFormData
            .flatMap(queryExampleService::createQueryExample)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<QueryExampleDetails>>
        updateQueryExample(final Long exampleId,
                       final Mono<QueryExampleFormData> queryExampleFormData,
                       final ServerWebExchange exchange) {
        return queryExampleFormData
            .flatMap(item -> queryExampleService.updateQueryExample(exampleId, item))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteQueryExample(final Long exampleId,
                                                         final ServerWebExchange exchange) {
        return queryExampleService.deleteQueryExample(exampleId)
            .thenReturn(ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<QueryExampleList>> getQueryExampleByDatasetId(final Long dataEntityId,
                                                                             final ServerWebExchange exchange) {
        return queryExampleService.getQueryExampleByDatasetId(dataEntityId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<QueryExampleList>> getQueryExampleByTermId(final Long termId,
                                                                          final ServerWebExchange exchange) {
        return queryExampleService.getQueryExampleByTermId(termId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<QueryExampleDetails>> getQueryExampleDetails(final Long exampleId,
                                                                            final ServerWebExchange exchange) {
        return queryExampleService.getQueryExampleDetails(exampleId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<QueryExampleRefList>> getQueryExampleList(final Integer page,
                                                                         final Integer size,
                                                                         final String query,
                                                                         final ServerWebExchange exchange) {
        return queryExampleService.getQueryExampleList(page, size, query)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<QueryExampleSearchFacetsData>> queryExamplesSearch(
        final Mono<QueryExampleSearchFormData> queryExampleSearchFormData,
        final ServerWebExchange exchange) {
        return queryExampleSearchFormData
            .flatMap(queryExampleSearchService::search)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<QueryExampleSearchFacetsData>>
        getQueryExampleSearchFacetList(final UUID searchId,
                                   final ServerWebExchange exchange) {
        return queryExampleSearchService.getFacets(searchId)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<QueryExampleList>> getQueryExampleSearchResults(final UUID searchId,
                                                                               final Integer page,
                                                                               final Integer size,
                                                                               final ServerWebExchange exchange) {
        return queryExampleSearchService
            .getSearchResults(searchId, page, size)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<QueryExampleSearchFacetsData>>
        updateQueryExampleSearchFacetList(final UUID searchId,
                                      final Mono<QueryExampleSearchFormData> queryExampleSearchFormData,
                                      final ServerWebExchange exchange) {
        return queryExampleSearchFormData
            .flatMap(fd -> queryExampleSearchService.updateFacets(searchId, fd))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<QueryExampleRefList>>
        getQueryExampleSearchSuggestions(final String query,
                                     final ServerWebExchange exchange) {
        return queryExampleSearchService.getQuerySuggestions(query)
            .map(ResponseEntity::ok);
    }
}
