package org.opendatadiscovery.oddplatform.service.term;

import java.util.Comparator;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.CountableSearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.MultipleFacetType;
import org.opendatadiscovery.oddplatform.api.contract.model.TermList;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRefList;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchFormData;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;
import org.opendatadiscovery.oddplatform.dto.SearchFilterId;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.FacetStateMapper;
import org.opendatadiscovery.oddplatform.mapper.SearchMapper;
import org.opendatadiscovery.oddplatform.mapper.TermMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;
import org.opendatadiscovery.oddplatform.repository.SearchFacetRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchFacetRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class TermSearchServiceImpl implements TermSearchService {

    private final FacetStateMapper facetStateMapper;
    private final SearchMapper searchMapper;
    private final TermMapper termMapper;
    private final ReactiveTermRepository reactiveTermRepository;
    private final ReactiveSearchFacetRepository reactiveSearchFacetRepository;

    @Override
    public Flux<CountableSearchFilter> getFilterOptions(final UUID searchId,
                                                        final MultipleFacetType facetType,
                                                        final Integer page,
                                                        final Integer size,
                                                        final String query) {
        return fetchFacetState(searchId)
            .map(facetStateMapper::pojoToState)
            .zipWhen(state -> createFacetFetchOperation(facetType, query, page, size).apply(state))
            .flatMapIterable(t -> {
                final Set<Long> selectedFilters = t.getT1().getFacetEntities(FacetType.lookup(facetType.getValue()))
                    .stream()
                    .filter(SearchFilterDto::isSelected)
                    .map(SearchFilterDto::getEntityId)
                    .collect(Collectors.toSet());

                return t.getT2()
                    .entrySet().stream()
                    .filter(e -> !selectedFilters.contains(e.getKey().getEntityId()))
                    .map(e -> searchMapper.mapCountableSearchFilter(e.getKey(), e.getValue()))
                    .sorted(Comparator.comparing(CountableSearchFilter::getCount).reversed())
                    .collect(Collectors.toList());
            });
    }

    @Override
    public Mono<TermSearchFacetsData> getFacets(final UUID searchId) {
        return fetchFacetState(searchId).flatMap(p -> getFacetsData(p.getId(), facetStateMapper.pojoToState(p)));
    }

    @Override
    public Mono<TermSearchFacetsData> search(final TermSearchFormData searchFormData) {
        final FacetStateDto state = FacetStateDto.removeUnselected(facetStateMapper.mapForm(searchFormData));

        return Mono.just(state)
            .map(facetStateMapper::mapStateToPojo)
            .flatMap(reactiveSearchFacetRepository::create)
            .flatMap(p -> getFacetsData(p.getId(), state));
    }

    @Override
    public Mono<TermSearchFacetsData> updateFacets(final UUID searchId, final TermSearchFormData formData) {
        final FacetStateDto delta = facetStateMapper.mapForm(formData);
        return fetchFacetState(searchId)
            .map(facetStateMapper::pojoToState)
            .map(currentState -> FacetStateDto.merge(currentState, delta))
            .map(mergedState -> facetStateMapper.mapStateToPojo(searchId, mergedState))
            .flatMap(reactiveSearchFacetRepository::update)
            .flatMap(p -> getFacetsData(p.getId(), facetStateMapper.pojoToState(p)));
    }

    @Override
    public Mono<TermRefList> getQuerySuggestions(final String query) {
        return reactiveTermRepository.getQuerySuggestions(query)
            .map(termMapper::mapToRefPage);
    }

    @Override
    public Mono<TermList> getSearchResults(final UUID searchId, final Integer page, final Integer size) {
        return fetchFacetState(searchId)
            .flatMap(pojo -> {
                final FacetStateDto state = facetStateMapper.pojoToState(pojo);
                return reactiveTermRepository.findByState(state, page, size);
            })
            .map(termMapper::mapToPage);
    }

    private Mono<SearchFacetsPojo> fetchFacetState(final UUID searchId) {
        return reactiveSearchFacetRepository.get(searchId)
            .switchIfEmpty(Mono.error(NotFoundException::new));
    }

    private Mono<TermSearchFacetsData> getFacetsData(final UUID searchId, final FacetStateDto state) {
        return reactiveTermRepository.countByState(state)
            .map(total -> new TermSearchFacetsData()
                .searchId(searchId)
                .query(state.getQuery())
                .total(total)
                .facetState(facetStateMapper.mapDto(state)));
    }

    private Function<FacetStateDto, Mono<Map<SearchFilterId, Long>>> createFacetFetchOperation(
        final MultipleFacetType facetType,
        final String query,
        final Integer page,
        final Integer size
    ) {
        return switch (facetType) {
            case TAGS -> s -> reactiveSearchFacetRepository.getTagFacetForTerms(query, page, size, s);
            case OWNERS -> s -> reactiveSearchFacetRepository.getOwnerFacetForTerms(query, page, size, s);
            default -> s -> Mono.just(Map.of());
        };
    }
}
