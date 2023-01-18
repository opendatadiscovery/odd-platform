package org.opendatadiscovery.oddplatform.service.search;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.api.contract.model.CountableSearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.MultipleFacetType;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;
import org.opendatadiscovery.oddplatform.dto.SearchFilterId;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.FacetStateMapper;
import org.opendatadiscovery.oddplatform.mapper.SearchMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchFacetRepository;
import org.opendatadiscovery.oddplatform.service.DataEntityService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchServiceImpl implements SearchService {
    private final SearchMapper searchMapper;
    private final FacetStateMapper facetStateMapper;
    private final DataEntityMapper dataEntityMapper;
    private final ReactiveSearchFacetRepository searchFacetRepository;
    private final DataEntityService dataEntityService;
    private final ReactiveDataEntityRepository reactiveDataEntityRepository;
    private final AuthIdentityProvider authIdentityProvider;

    @Override
    public Flux<CountableSearchFilter> getFilterOptions(final UUID searchId,
                                                        final MultipleFacetType facetType,
                                                        final Integer page,
                                                        final Integer size,
                                                        final String query) {
        return fetchFacetState(searchId)
            .map(facetStateMapper::pojoToState)
            .flatMapMany(state -> getFacetFetchOperation(facetType, query, page, size)
                .apply(state)
                .map(facetMap -> removeSelectedFiltersAndMap(facetMap, state, facetType))
                .flatMapIterable(Function.identity())
            );
    }

    @Override
    public Mono<SearchFacetsData> getFacets(final UUID searchId) {
        return fetchFacetState(searchId)
            .flatMap(pojo -> {
                final FacetStateDto state = facetStateMapper.pojoToState(pojo);
                return getFacetsData(pojo.getId(), state);
            });
    }

    @Override
    public Mono<SearchFacetsData> search(final SearchFormData formData) {
        final FacetStateDto state = FacetStateDto.removeUnselected(facetStateMapper.mapForm(formData));

        return Mono
            .just(facetStateMapper.mapStateToPojo(state))
            .flatMap(searchFacetRepository::create)
            .flatMap(p -> getFacetsData(p.getId(), state));
    }

    @Override
    public Mono<SearchFacetsData> updateFacets(final UUID searchId, final SearchFormData formData) {
        final FacetStateDto delta = facetStateMapper.mapForm(formData);

        return fetchFacetState(searchId)
            .map(facetsRecord -> {
                final FacetStateDto currentState = facetStateMapper.pojoToState(facetsRecord);
                final FacetStateDto mergedState = FacetStateDto.merge(currentState, delta);
                return facetStateMapper.mapStateToPojo(searchId, mergedState);
            })
            .flatMap(searchFacetRepository::update)
            .flatMap(p -> getFacetsData(p.getId(), facetStateMapper.pojoToState(p)));
    }

    @Override
    public Mono<DataEntityList> getSearchResults(final UUID searchId,
                                                 final Integer page,
                                                 final Integer size) {
        return fetchFacetState(searchId)
            .flatMap(pojo -> {
                final FacetStateDto state = facetStateMapper.pojoToState(pojo);
                if (state.isMyObjects()) {
                    return authIdentityProvider.fetchAssociatedOwner()
                        .flatMap(owner -> dataEntityService.findByState(state, page, size, owner));
                }
                return dataEntityService.findByState(state, page, size);
            });
    }

    @Override
    public Flux<DataEntityRef> getQuerySuggestions(final String query,
                                                   final Integer entityClassId,
                                                   final Boolean manuallyCreated) {
        return reactiveDataEntityRepository.getQuerySuggestions(query, entityClassId, manuallyCreated)
            .map(dataEntityMapper::mapRef);
    }

    private Mono<SearchFacetsData> getFacetsData(final UUID searchId, final FacetStateDto state) {
        final Mono<Map<SearchFilterId, Long>> entityClassFacet = searchFacetRepository
            .getEntityClassFacetForDataEntity(state);

        final Mono<Long> allCount = reactiveDataEntityRepository.countByState(state);

        final Mono<Long> myObjectsCount = authIdentityProvider.fetchAssociatedOwner()
            .flatMap(owner -> reactiveDataEntityRepository.countByState(state, owner))
            .switchIfEmpty(Mono.just(0L));

        return Mono.zip(entityClassFacet, allCount, myObjectsCount).map(
            function((entityClassFacetMap, totalCount, myObjectsTotalCount) -> {
                final List<CountableSearchFilter> entityClasses = entityClassFacetMap.entrySet().stream()
                    .map(e -> searchMapper.mapCountableSearchFilter(e.getKey(), e.getValue()))
                    .sorted(Comparator.comparing(CountableSearchFilter::getCount).reversed())
                    .toList();

                state.selectedDataEntityClass().ifPresent(id -> {
                    for (final CountableSearchFilter entityClass : entityClasses) {
                        if (entityClass.getId().equals(id)) {
                            entityClass.setSelected(true);
                        }
                    }
                });

                return new SearchFacetsData()
                    .searchId(searchId)
                    .query(state.getQuery())
                    .total(totalCount)
                    .myObjectsTotal(myObjectsTotalCount)
                    .myObjects(state.isMyObjects())
                    .facetState(facetStateMapper.mapDto(entityClasses, state));
            }));
    }

    private Mono<SearchFacetsPojo> fetchFacetState(final UUID searchId) {
        return searchFacetRepository.get(searchId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Search not found")));
    }

    private Function<FacetStateDto, Mono<Map<SearchFilterId, Long>>> getFacetFetchOperation(
        final MultipleFacetType facetType,
        final String query,
        final Integer page,
        final Integer size
    ) {
        return switch (facetType) {
            case TAGS -> s -> searchFacetRepository.getTagFacetForDataEntity(query, page, size, s);
            case OWNERS -> s -> searchFacetRepository.getOwnerFacetForDataEntity(query, page, size, s);
            case TYPES -> s -> searchFacetRepository.getTypeFacetForDataEntity(query, page, size, s);
            case GROUPS -> s -> searchFacetRepository.getGroupFacetForDataEntity(query, page, size, s);
        };
    }

    private List<CountableSearchFilter> removeSelectedFiltersAndMap(final Map<SearchFilterId, Long> facetFiltersMap,
                                                                    final FacetStateDto state,
                                                                    final MultipleFacetType facetType) {
        final Set<Long> selectedFilters = getSelectedFilters(state, facetType);
        return facetFiltersMap.entrySet().stream()
            .filter(e -> !selectedFilters.contains(e.getKey().getEntityId()))
            .map(e -> searchMapper.mapCountableSearchFilter(e.getKey(), e.getValue()))
            .sorted(Comparator.comparing(CountableSearchFilter::getCount).reversed())
            .collect(Collectors.toList());
    }

    private Set<Long> getSelectedFilters(final FacetStateDto state,
                                         final MultipleFacetType facetType) {
        return state.getFacetEntities(FacetType.lookup(facetType.getValue()))
            .stream()
            .filter(SearchFilterDto::isSelected)
            .map(SearchFilterDto::getEntityId)
            .collect(Collectors.toSet());
    }
}
