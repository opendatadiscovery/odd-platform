package org.opendatadiscovery.oddplatform.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.EnumSet;
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
    // CTRIB-053 / #1836 ST-2a — the named ordering (SearchSortDto name; nullable = per-context default).
    // A session-level property (not a facet): it must be PRESERVED across removeUnselected + a facet-toggle
    // merge, and it round-trips in the JSONB session blob via mapStateToPojo/pojoToState.
    private String sort;
    // ST-11 (#1845) — the facets whose positive values must ALL be carried ("Match all"); absent / empty = the
    // default any-of on every facet. A session-level property like `sort`: preserved by merge, round-tripped in the
    // JSONB session blob (a row stored before ST-11 reads it back null → empty).
    private Set<FacetType> matchAll;

    /** The pre-ST-11 constructor, kept so every existing call site reads unchanged (no match-all mode). */
    public FacetStateDto(final Map<FacetType, List<SearchFilterDto>> state, final String query,
                         final boolean myObjects, final String sort) {
        this(state, query, myObjects, sort, Set.of());
    }

    public static FacetStateDto empty() {
        return new FacetStateDto(Map.of(), "", false, null);
    }

    /**
     * Keeps every SELECTED item — positive AND excluded (an exclusion is an active part of the search) — and applies
     * the both-listed rule: a value listed as a positive and as an exclusion in the same facet is read as EXCLUDED,
     * the narrower explicit intent (the UI never writes both; a hand-edited link or a direct API client can).
     */
    public static FacetStateDto removeUnselected(final FacetStateDto facetState) {
        final Map<FacetType, List<SearchFilterDto>> state = facetState.getState().entrySet()
            .stream()
            .map(e -> Pair.of(e.getKey(), collapseBothListed(e.getValue().stream()
                .filter(SearchFilterDto::isSelected)
                .collect(Collectors.toList()))))
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));

        return new FacetStateDto(state, facetState.getQuery(), facetState.isMyObjects(), facetState.getSort(),
            facetState.getMatchAll());
    }

    private static List<SearchFilterDto> collapseBothListed(final List<SearchFilterDto> filters) {
        final Set<Long> excludedIds = filters.stream()
            .filter(SearchFilterDto::isExclude)
            .map(SearchFilterDto::getEntityId)
            .collect(Collectors.toSet());
        if (excludedIds.isEmpty()) {
            return filters;
        }
        return filters.stream()
            .filter(f -> f.isExclude() || !excludedIds.contains(f.getEntityId()))
            .collect(Collectors.toList());
    }

    public static FacetStateDto merge(final FacetStateDto currentState, final FacetStateDto delta) {
        final Map<FacetType, List<SearchFilterDto>> newState = new HashMap<>(currentState.getState());

        for (final Map.Entry<FacetType, List<SearchFilterDto>> deltaEntry : delta.getState().entrySet()) {
            newState.merge(deltaEntry.getKey(), deltaEntry.getValue(), FacetStateDto::mergeFacetState);
        }

        // A facet-toggle delta carries no sort of its own; preserve the session's current sort so a
        // filter change never silently resets the ordering (CTRIB-053). The match-all mode follows the same rule.
        final String mergedSort = delta.getSort() != null ? delta.getSort() : currentState.getSort();
        final Set<FacetType> mergedMatchAll = delta.getMatchAll().isEmpty()
            ? currentState.getMatchAll() : delta.getMatchAll();
        return new FacetStateDto(newState, delta.getQuery(), delta.isMyObjects(), mergedSort, mergedMatchAll);
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

    /**
     * EVERY selected item of a facet — positive and excluded, the {@code exclude} flag intact. This is the view for
     * the readers that NAME, ECHO or HIDE a selection (the session echo, the ST-1d name resolution, the option-list
     * hide): an excluded chip must be named on a fresh deep link exactly like a positive one. A reader that builds
     * a PREDICATE takes {@link #getPositiveFacetEntities} / {@link #getPositiveState} instead — reading this list as
     * positives would invert an exclusion.
     */
    public List<SearchFilterDto> getFacetEntities(final FacetType facetType) {
        return state.getOrDefault(facetType, List.of());
    }

    public Set<Long> getFacetEntitiesIds(final FacetType facetType) {
        return getFacetEntities(facetType)
            .stream()
            .map(SearchFilterDto::getEntityId)
            .collect(Collectors.toSet());
    }

    /** The POSITIVE selections of a facet (ST-11): the values an asset must carry — any of them, or all of them. */
    public List<SearchFilterDto> getPositiveFacetEntities(final FacetType facetType) {
        return getFacetEntities(facetType).stream()
            .filter(f -> !f.isExclude())
            .collect(Collectors.toList());
    }

    public Set<Long> getPositiveFacetEntitiesIds(final FacetType facetType) {
        return getPositiveFacetEntities(facetType).stream()
            .map(SearchFilterDto::getEntityId)
            .collect(Collectors.toSet());
    }

    /** The EXCLUDED values of a facet (ST-11): an asset carrying any of them is removed. */
    public List<SearchFilterDto> getExcludedFacetEntities(final FacetType facetType) {
        return getFacetEntities(facetType).stream()
            .filter(SearchFilterDto::isExclude)
            .collect(Collectors.toList());
    }

    public Set<Long> getExcludedFacetEntitiesIds(final FacetType facetType) {
        return getExcludedFacetEntities(facetType).stream()
            .map(SearchFilterDto::getEntityId)
            .collect(Collectors.toSet());
    }

    /**
     * {@code true} when a POSITIVE {@code DELETED} status is selected — the one selection that lifts the default
     * {@code status != DELETED} eligibility of every data-entity read on a search path (the legacy results and
     * count queries, the cross-kind list, and the page's resolution into renderable refs). An EXCLUSION of
     * {@code DELETED} is not a request for deleted entities: they are out by default, so it changes nothing.
     */
    @JsonIgnore
    public boolean isDeletedRequested() {
        return getPositiveFacetEntitiesIds(FacetType.STATUSES)
            .contains((long) DataEntityStatusDto.DELETED.getId());
    }

    /** {@code true} when the facet's positive values must ALL be carried ("Match all"); default any-of. */
    public boolean isMatchAll(final FacetType facetType) {
        return matchAll != null && matchAll.contains(facetType);
    }

    public Set<FacetType> getMatchAll() {
        return matchAll == null ? Set.of() : matchAll;
    }

    /**
     * The state map with every EXCLUDED item removed — the view for the legacy predicate compilers
     * ({@code JooqFTSHelper.facetStateConditions} / {@code resultFacetStateConditions}) and the DELETED-requested
     * check, which read the raw map as a list of positives. The legacy results path thereby keeps today's semantics
     * (positives only) while never reading an exclusion as a positive. Not a JSON property: the session blob stores
     * {@code state} only (unknown properties are ignored on read, but the derived views must not be written).
     */
    @JsonIgnore
    public Map<FacetType, List<SearchFilterDto>> getPositiveState() {
        final Map<FacetType, List<SearchFilterDto>> positive = new HashMap<>();
        for (final Map.Entry<FacetType, List<SearchFilterDto>> e : state.entrySet()) {
            positive.put(e.getKey(), e.getValue().stream()
                .filter(f -> !f.isExclude())
                .collect(Collectors.toList()));
        }
        return positive;
    }

    /** The facets carrying at least one positive value or one exclusion — the facets the compiler must visit. */
    @JsonIgnore
    public Set<FacetType> getActiveFacets() {
        final Set<FacetType> active = EnumSet.noneOf(FacetType.class);
        for (final Map.Entry<FacetType, List<SearchFilterDto>> e : state.entrySet()) {
            if (!e.getValue().isEmpty()) {
                active.add(e.getKey());
            }
        }
        return active;
    }

    /** The first POSITIVE entity class — the legacy single-class session's selected class (never an excluded one). */
    public Optional<Long> selectedDataEntityClass() {
        return getPositiveFacetEntities(FacetType.ENTITY_CLASSES)
            .stream()
            .filter(SearchFilterDto::isSelected)
            .map(SearchFilterDto::getEntityId)
            .findFirst();
    }
}
