package org.opendatadiscovery.oddplatform.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleList;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleRefList;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleSearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleSearchFormData;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.FacetStateMapper;
import org.opendatadiscovery.oddplatform.mapper.QueryExampleMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityToQueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
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
    private final ReactiveDataEntityRepository reactiveDataEntityRepository;
    private final FacetStateMapper facetStateMapper;
    private final QueryExampleMapper queryExampleMapper;
    private final DataEntityMapper dataEntityMapper;

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
            .map(dtoPage -> {
                final Set<Long> dataEntitiesId = dtoPage.getData().stream()
                    .flatMap(entity -> entity.linkedEntities()
                        .stream()
                        .map(DataEntityToQueryExamplePojo::getDataEntityId))
                    .collect(Collectors.toSet());

                final Map<QueryExamplePojo, List<DataEntityPojo>> queryExamplePojoListMap = new HashMap<>();

                return reactiveDataEntityRepository
                    .get(dataEntitiesId.stream().toList())
                    .collectList()
                    .map(dataEntities -> {
                        dtoPage.getData().forEach(datum -> {
                            queryExamplePojoListMap.put(datum.queryExamplePojo(), new ArrayList<>());
                            final Set<Long> collect =
                                datum.linkedEntities().stream()
                                    .map(DataEntityToQueryExamplePojo::getDataEntityId)
                                    .collect(Collectors.toSet());

                            dataEntities.stream()
                                .filter(item -> collect.contains(item.getId()))
                                .forEach(item -> queryExamplePojoListMap.get(datum.queryExamplePojo()).add(item));
                        });

                        return queryExampleMapper.mapToQueryExamplePage(queryExamplePojoListMap,
                            dtoPage.getTotal(), dtoPage.isHasNext());
                    });
            })
            .flatMap(Function.identity());
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
