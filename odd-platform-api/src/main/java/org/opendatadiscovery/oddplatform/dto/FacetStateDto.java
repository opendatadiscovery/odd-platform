package org.opendatadiscovery.oddplatform.dto;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.utils.Pair;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Slf4j
public class FacetStateDto {
    private Map<FacetType, List<SearchFilterDto>> state;
    private String query;
    private boolean myObjects;

    public static FacetStateDto empty() {
        return new FacetStateDto(Map.of(), "", false);
    }

    public static FacetStateDto removeUnselected(final FacetStateDto facetState) {
        final Map<FacetType, List<SearchFilterDto>> state = facetState.getState().entrySet()
            .stream()
            .map(e -> Pair.of(e.getKey(), e.getValue().stream()
                .filter(SearchFilterDto::isSelected)
                .collect(Collectors.toList())))
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));

        return new FacetStateDto(state, facetState.getQuery(), facetState.isMyObjects());
    }

    public static FacetStateDto merge(final FacetStateDto currentState, final FacetStateDto delta) {
        final Map<FacetType, List<SearchFilterDto>> newState = new HashMap<>(currentState.getState());

        for (final Map.Entry<FacetType, List<SearchFilterDto>> deltaEntry : delta.getState().entrySet()) {
            newState.merge(deltaEntry.getKey(), deltaEntry.getValue(), FacetStateDto::mergeFacetState);
        }

        return new FacetStateDto(newState, currentState.getQuery(), delta.isMyObjects());
    }

    private static List<SearchFilterDto> mergeFacetState(final List<SearchFilterDto> currentFilters,
                                                         final List<SearchFilterDto> deltaFilters) {
        final Map<Long, SearchFilterDto> currentMap = filtersMap(currentFilters);

        final Map<Long, SearchFilterDto> result = new HashMap<>(currentMap);

        for (final Map.Entry<Long, SearchFilterDto> deltaEntry : filtersMap(deltaFilters).entrySet()) {
            result.merge(deltaEntry.getKey(), deltaEntry.getValue(), (cur, delta) -> delta.isSelected() ? cur : null);
        }

        return result.values()
            .stream()
            .filter(Objects::nonNull)
            .filter(SearchFilterDto::isSelected)
            .collect(Collectors.toList());
    }

    private static Map<Long, SearchFilterDto> filtersMap(final List<SearchFilterDto> filters) {
        return filters.stream().collect(Collectors.toMap(SearchFilterDto::getEntityId, Function.identity()));
    }

    public List<SearchFilterDto> getFacetEntities(final FacetType facetType) {
        return state.getOrDefault(facetType, List.of());
    }

    public Set<Long> getFacetEntitiesIds(final FacetType facetType) {
        return getFacetEntities(facetType)
            .stream()
            .map(SearchFilterDto::getEntityId)
            .collect(Collectors.toSet());
    }

    public Optional<Long> selectedDataEntityClass() {
        return getFacetEntities(FacetType.ENTITY_CLASSES)
            .stream()
            .filter(SearchFilterDto::isSelected)
            .map(SearchFilterDto::getEntityId)
            .findFirst();
    }
}
