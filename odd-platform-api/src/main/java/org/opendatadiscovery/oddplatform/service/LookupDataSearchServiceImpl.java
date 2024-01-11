package org.opendatadiscovery.oddplatform.service;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableList;
import org.opendatadiscovery.oddplatform.api.contract.model.ReferenceDataSearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.ReferenceDataSearchFormData;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.FacetStateMapper;
import org.opendatadiscovery.oddplatform.mapper.LookupTableMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLookupTableRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchFacetRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class LookupDataSearchServiceImpl implements LookupDataSearchService {
    private final ReactiveSearchFacetRepository reactiveSearchFacetRepository;
    private final ReactiveLookupTableRepository tableRepository;
    private final FacetStateMapper facetStateMapper;
    private final LookupTableMapper tableMapper;

    @Override
    public Mono<ReferenceDataSearchFacetsData> search(final ReferenceDataSearchFormData searchFormData) {
        final FacetStateDto state = FacetStateDto.removeUnselected(facetStateMapper.mapForm(searchFormData));

        return Mono.just(state)
            .map(facetStateMapper::mapStateToPojo)
            .flatMap(reactiveSearchFacetRepository::create)
            .flatMap(p -> getFacetsData(p.getId(), state));
    }

    @Override
    public Mono<ReferenceDataSearchFacetsData> getFacets(final UUID searchId) {
        return fetchFacetState(searchId).flatMap(p -> getFacetsData(p.getId(), facetStateMapper.pojoToState(p)));
    }

    @Override
    public Mono<ReferenceDataSearchFacetsData> updateFacets(final UUID searchId, final ReferenceDataSearchFormData fd) {
        final FacetStateDto delta = FacetStateDto.removeUnselected(facetStateMapper.mapForm(fd));
        return fetchFacetState(searchId)
            .map(facetStateMapper::pojoToState)
            .map(currentState -> FacetStateDto.merge(currentState, delta))
            .map(mergedState -> facetStateMapper.mapStateToPojo(searchId, mergedState))
            .flatMap(reactiveSearchFacetRepository::update)
            .flatMap(p -> getFacetsData(p.getId(), facetStateMapper.pojoToState(p)));
    }

    @Override
    public Mono<LookupTableList> getSearchResults(final UUID searchId, final Integer page, final Integer size) {
        return fetchFacetState(searchId)
            .flatMap(pojo -> {
                final FacetStateDto state = facetStateMapper.pojoToState(pojo);
                return tableRepository.findByState(state, page, size);
            })
            .map(tableMapper::mapPageToLookupTable);
    }

    private Mono<ReferenceDataSearchFacetsData> getFacetsData(final UUID searchId, final FacetStateDto state) {
        return tableRepository.countByState(state)
            .map(total -> new ReferenceDataSearchFacetsData()
                .searchId(searchId)
                .query(state.getQuery())
                .total(total));
    }

    private Mono<SearchFacetsPojo> fetchFacetState(final UUID searchId) {
        return reactiveSearchFacetRepository.get(searchId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Search not found")));
    }
}
