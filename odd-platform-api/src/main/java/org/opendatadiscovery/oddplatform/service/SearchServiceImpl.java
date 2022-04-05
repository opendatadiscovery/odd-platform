package org.opendatadiscovery.oddplatform.service;

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
import org.opendatadiscovery.oddplatform.repository.DataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.SearchFacetRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchServiceImpl implements SearchService {
    private final SearchMapper searchMapper;
    private final FacetStateMapper facetStateMapper;
    private final DataEntityMapper dataEntityMapper;
    private final SearchFacetRepository searchFacetRepository;
    private final DataEntityRepository dataEntityRepository;

    private final AuthIdentityProvider authIdentityProvider;

    @Override
    public Flux<CountableSearchFilter> getFilterOptions(final UUID searchId,
                                                        final MultipleFacetType facetType,
                                                        final Integer page,
                                                        final Integer size,
                                                        final String query) {
        return fetchFacetState(searchId)
            .map(facetStateMapper::pojoToState)
            .flatMapIterable(state -> {
                final Set<Long> selectedFilters = state.getFacetEntities(FacetType.lookup(facetType.getValue()))
                    .stream()
                    .filter(SearchFilterDto::isSelected)
                    .map(SearchFilterDto::getEntityId)
                    .collect(Collectors.toSet());

                return createFacetFetchOperation(facetType, query, page, size)
                    .apply(state)
                    .entrySet().stream()
                    .filter(e -> !selectedFilters.contains(e.getKey().getEntityId()))
                    .map(e -> searchMapper.mapCountableSearchFilter(e.getKey(), e.getValue()))
                    .sorted(Comparator.comparing(CountableSearchFilter::getCount).reversed())
                    .collect(Collectors.toList());
            });
    }

    @Override
    public Mono<SearchFacetsData> getFacets(final UUID searchId) {
        return fetchFacetState(searchId).flatMap(p -> getFacetsData(p.getId(), facetStateMapper.pojoToState(p)));
    }

    @Override
    public Mono<SearchFacetsData> search(final SearchFormData formData) {
        final FacetStateDto state = FacetStateDto.removeUnselected(facetStateMapper.mapForm(formData));

        return Mono
            .just(facetStateMapper.mapStateToPojo(state))
            .map(searchFacetRepository::persistFacetState)
            .flatMap(p -> getFacetsData(p.getId(), state));
    }

    @Override
    public Mono<SearchFacetsData> updateFacets(final UUID searchId, final SearchFormData formData) {
        final FacetStateDto delta = facetStateMapper.mapForm(formData);

        return fetchFacetState(searchId)
            .map(facetStateMapper::pojoToState)
            .map(currentState -> FacetStateDto.merge(currentState, delta))
            .map(mergedState -> facetStateMapper.mapStateToPojo(searchId, mergedState))
            .map(searchFacetRepository::updateFacetState)
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
                        .map(owner -> dataEntityRepository.findByState(state, page, size, owner))
                        .switchIfEmpty(Mono.fromCallable(() -> dataEntityRepository.findByState(state, page, size)));
                }

                return Mono.fromCallable(() -> dataEntityRepository.findByState(state, page, size));
            })
            .map(dataEntityMapper::mapPojos);
    }

    @Override
    public Flux<DataEntityRef> getQuerySuggestions(final String query) {
        return Flux
            .fromIterable(dataEntityRepository.getQuerySuggestions(query))
            .map(dataEntityMapper::mapRef);
    }

    private Mono<SearchFacetsData> getFacetsData(final UUID searchId, final FacetStateDto state) {
        final Mono<Map<SearchFilterId, Long>> entityClassFacet = fetchEntityClassFacet(state);

        final Mono<Long> allCount = Mono.fromCallable(() -> dataEntityRepository.countByState(state));

        final Mono<Long> myObjectsTotal = authIdentityProvider.fetchAssociatedOwner()
            .map(owner -> dataEntityRepository.countByState(state, owner))
            .switchIfEmpty(Mono.just(0L));

        return Mono.zip(entityClassFacet, allCount, myObjectsTotal)
            .map(tuple -> {
                final List<CountableSearchFilter> entityClasses = tuple.getT1().entrySet().stream()
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
                    .total(tuple.getT2())
                    .myObjectsTotal(tuple.getT3())
                    .myObjects(state.isMyObjects())
                    .facetState(facetStateMapper.mapDto(entityClasses, state));
            });
    }

    private Mono<Map<SearchFilterId, Long>> fetchEntityClassFacet(final FacetStateDto state) {
        return Mono.fromCallable(() -> searchFacetRepository.getEntityClassFacet(state));
    }

    private Mono<SearchFacetsPojo> fetchFacetState(final UUID searchId) {
        return Mono
            .fromCallable(() -> searchFacetRepository.getFacetState(searchId))
            .flatMap(optional -> optional.isEmpty()
                ? Mono.error(new NotFoundException())
                : Mono.just(optional.get()));
    }

    private Function<FacetStateDto, Map<SearchFilterId, Long>> createFacetFetchOperation(
        final MultipleFacetType facetType,
        final String query,
        final Integer page,
        final Integer size
    ) {
        return switch (facetType) {
            case TAGS -> s -> searchFacetRepository.getTagFacet(query, page, size, s);
            case OWNERS -> s -> searchFacetRepository.getOwnerFacet(query, page, size, s);
            case TYPES -> s -> searchFacetRepository.getTypeFacet(query, page, size, s);
        };
    }
}
