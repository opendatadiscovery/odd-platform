package org.opendatadiscovery.oddplatform.service;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleList;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleRefList;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleSearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleSearchFormData;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.FacetStateMapper;
import org.opendatadiscovery.oddplatform.mapper.QueryExampleMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchFacetRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class QueryExampleSearchServiceImpl implements QueryExampleSearchService {
    private final ReactiveQueryExampleRepository queryExampleRepository;
    private final ReactiveQueryExampleSearchEntrypointRepository queryExampleSearchEntrypointRepository;
    private final ReactiveSearchFacetRepository reactiveSearchFacetRepository;
    private final FacetStateMapper facetStateMapper;
    private final QueryExampleMapper queryExampleMapper;

    @Override
    public Mono<QueryExampleRefList> getQuerySuggestions(final String query) {
        return queryExampleSearchEntrypointRepository.getQuerySuggestions(query)
            .map(queryExampleMapper::mapToRefPage);
    }

    @Override
    public Mono<QueryExampleSearchFacetsData> search(final QueryExampleSearchFormData searchFormData) {
        final FacetStateDto state = FacetStateDto.removeUnselected(facetStateMapper.mapForm(searchFormData));

        return Mono.just(state)
            .map(facetStateMapper::mapStateToPojo)
            .flatMap(reactiveSearchFacetRepository::create)
            .flatMap(p -> getFacetsData(p.getId(), state));
    }

    @Override
    public Mono<QueryExampleSearchFacetsData> getFacets(final UUID searchId) {
        return fetchFacetState(searchId).flatMap(p -> getFacetsData(p.getId(), facetStateMapper.pojoToState(p)));
    }

    @Override
    public Mono<QueryExampleList> getSearchResults(final UUID searchId,
                                                   final Integer page,
                                                   final Integer size) {
        return fetchFacetState(searchId)
            .flatMap(pojo -> {
                final FacetStateDto state = facetStateMapper.pojoToState(pojo);
                return queryExampleRepository.findByState(state, page, size);
            })
            .map(queryExampleMapper::mapPageToQueryExample);
    }

    @Override
    public Mono<QueryExampleSearchFacetsData> updateFacets(final UUID searchId, final QueryExampleSearchFormData fd) {
        final FacetStateDto delta = FacetStateDto.removeUnselected(facetStateMapper.mapForm(fd));
        return fetchFacetState(searchId)
            .map(facetStateMapper::pojoToState)
            .map(currentState -> FacetStateDto.merge(currentState, delta))
            .map(mergedState -> facetStateMapper.mapStateToPojo(searchId, mergedState))
            .flatMap(reactiveSearchFacetRepository::update)
            .flatMap(p -> getFacetsData(p.getId(), facetStateMapper.pojoToState(p)));
    }

    private Mono<SearchFacetsPojo> fetchFacetState(final UUID searchId) {
        return reactiveSearchFacetRepository.get(searchId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Search not found")));
    }

    private Mono<QueryExampleSearchFacetsData> getFacetsData(final UUID searchId, final FacetStateDto state) {
        return queryExampleRepository.countByState(state)
            .map(total -> new QueryExampleSearchFacetsData()
                .searchId(searchId)
                .query(state.getQuery())
                .total(total));
    }
}
