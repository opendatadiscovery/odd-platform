package org.opendatadiscovery.oddplatform.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.api.contract.model.CountableSearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.FacetState;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.ReferenceDataSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFilterState;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.opendatadiscovery.oddplatform.api.contract.model.TermFacetState;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchFormDataFilters;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;

import static java.util.stream.Collectors.groupingBy;

@Slf4j
@Component
@RequiredArgsConstructor
public class FacetStateMapperImpl implements FacetStateMapper {

    private static final Map<Function<SearchFormDataFilters, List<SearchFilterState>>, FacetType> FORM_MAPPINGS =
        Map.of(
            SearchFormDataFilters::getEntityClasses, FacetType.ENTITY_CLASSES,
            SearchFormDataFilters::getTypes, FacetType.TYPES,
            SearchFormDataFilters::getDatasources, FacetType.DATA_SOURCES,
            SearchFormDataFilters::getNamespaces, FacetType.NAMESPACES,
            SearchFormDataFilters::getOwners, FacetType.OWNERS,
            SearchFormDataFilters::getTags, FacetType.TAGS,
            SearchFormDataFilters::getGroups, FacetType.GROUPS,
            SearchFormDataFilters::getStatuses, FacetType.STATUSES
        );

    private static final Map<Function<TermSearchFormDataFilters, List<SearchFilterState>>, FacetType>
        TERM_FORM_MAPPINGS =
        Map.of(
            TermSearchFormDataFilters::getNamespaces, FacetType.NAMESPACES,
            TermSearchFormDataFilters::getOwners, FacetType.OWNERS,
            TermSearchFormDataFilters::getTags, FacetType.TAGS
        );

    /**
     * ST-11 (#1845): the wire tokens of {@code SearchFormDataFilters.match_all} — the facet property names of the
     * filters object (the way a client names a facet) plus the enum names, matched case-insensitively. An
     * unrecognised token is DROPPED, never a 400: a stale or hand-edited shareable URL degrades instead of failing
     * (the {@code sort} / {@code my_data} posture).
     */
    private static final Map<String, FacetType> MATCH_ALL_TOKENS = Map.ofEntries(
        Map.entry("TAGS", FacetType.TAGS),
        Map.entry("OWNERS", FacetType.OWNERS),
        Map.entry("GROUPS", FacetType.GROUPS),
        Map.entry("ENTITY_CLASSES", FacetType.ENTITY_CLASSES),
        Map.entry("ENTITYCLASSES", FacetType.ENTITY_CLASSES),
        Map.entry("NAMESPACES", FacetType.NAMESPACES),
        Map.entry("DATASOURCES", FacetType.DATA_SOURCES),
        Map.entry("DATA_SOURCES", FacetType.DATA_SOURCES),
        Map.entry("STATUSES", FacetType.STATUSES),
        Map.entry("TYPES", FacetType.TYPES)
    );

    private final SearchMapper searchMapper;

    @Override
    public SearchFacetsPojo mapStateToPojo(final FacetStateDto state) {
        return mapStateToPojo(null, state);
    }

    @Override
    public SearchFacetsPojo mapStateToPojo(final UUID searchId, final FacetStateDto state) {
        return new SearchFacetsPojo()
            .setId(searchId)
            .setQueryString(StringUtils.isNotEmpty(state.getQuery()) ? state.getQuery().trim() : state.getQuery())
            .setLastAccessedAt(OffsetDateTime.now(ZoneOffset.UTC))
            .setFilters(JSONB.jsonb(JSONSerDeUtils.serializeJson(state)));
    }

    @Override
    public FacetStateDto mapForm(final SearchFormData formData) {
        final SearchFormDataFilters filters = formData.getFilters();
        final boolean myObjects = formData.getMyObjects() != null ? formData.getMyObjects() : false;
        // capture sort BEFORE the null-filters early-return so a browse-with-sort-and-no-filters
        // does not silently default (CTRIB-053 / #1836 ST-2a; filters is `required` so this is a
        // defensive path, but the sort must survive it)
        if (filters == null) {
            return new FacetStateDto(Map.of(), formData.getQuery(), myObjects, formData.getSort());
        }

        final Map<FacetType, List<SearchFilterDto>> state = FORM_MAPPINGS.entrySet().stream()
            .map(e -> {
                final List<SearchFilterState> filterList = e.getKey().apply(filters);
                if (filterList == null) {
                    return null;
                }

                return filterList
                    .stream()
                    .map(f -> mapFilter(f, e.getValue()))
                    .collect(Collectors.toList());
            })
            .filter(Objects::nonNull)
            .flatMap(List::stream)
            .collect(groupingBy(SearchFilterDto::getType));

        return new FacetStateDto(
            state,
            formData.getQuery(),
            myObjects,
            formData.getSort(),
            matchAllFacets(filters.getMatchAll())
        );
    }

    @Override
    public FacetStateDto mapForm(final TermSearchFormData formData) {
        final TermSearchFormDataFilters filters = formData.getFilters();

        // ST-11 (#1845): the Dictionary search shares SearchFilterState but has no exclusion — an item carrying
        // `exclude: true` is REMOVED here (never read as a positive, which would invert the caller's intent).
        final Map<FacetType, List<SearchFilterDto>> state = TERM_FORM_MAPPINGS.entrySet().stream()
            .map(e -> {
                final List<SearchFilterState> filterList = e.getKey().apply(filters);
                if (filterList == null) {
                    return null;
                }

                return filterList
                    .stream()
                    .filter(f -> !Boolean.TRUE.equals(f.getExclude()))
                    .map(f -> mapFilter(f, e.getValue()))
                    .collect(Collectors.toList());
            })
            .filter(Objects::nonNull)
            .flatMap(List::stream)
            .collect(groupingBy(SearchFilterDto::getType));

        return new FacetStateDto(
            state,
            formData.getQuery(),
            false,
            null
        );
    }

    @Override
    public FacetStateDto mapForm(final QueryExampleSearchFormData formData) {
        return new FacetStateDto(
            Map.of(),
            formData.getQuery(),
            false,
            null
        );
    }

    @Override
    public FacetStateDto mapForm(final ReferenceDataSearchFormData formData) {
        return new FacetStateDto(
            Map.of(),
            formData.getQuery(),
            false,
            null
        );
    }

    /** ST-11: the {@code match_all} tokens → facet types; unknown tokens dropped (logged), never a failure. */
    static Set<FacetType> matchAllFacets(final List<String> tokens) {
        final Set<FacetType> facets = EnumSet.noneOf(FacetType.class);
        if (tokens == null) {
            return facets;
        }
        for (final String token : tokens) {
            final FacetType facet = token == null ? null : MATCH_ALL_TOKENS.get(token.trim().toUpperCase());
            if (facet == null) {
                log.debug("Unknown match_all facet token {} dropped", token);
            } else {
                facets.add(facet);
            }
        }
        return facets;
    }

    @Override
    public FacetStateDto pojoToState(final SearchFacetsPojo facetsRecord) {
        return JSONSerDeUtils.deserializeJson(facetsRecord.getFilters().data(), new TypeReference<>() {
        });
    }

    @Override
    public TermFacetState mapDto(final FacetStateDto state) {
        return new TermFacetState()
            .owners(getSearchFiltersForFacetType(state, FacetType.OWNERS))
            .namespaces(getSearchFiltersForFacetType(state, FacetType.NAMESPACES))
            .tags(getSearchFiltersForFacetType(state, FacetType.TAGS));
    }

    @Override
    public FacetState mapDto(final List<CountableSearchFilter> entityClasses, final FacetStateDto state) {
        return new FacetState()
            .entityClasses(entityClasses)
            .datasources(getSearchFiltersForFacetType(state, FacetType.DATA_SOURCES))
            .types(getSearchFiltersForFacetType(state, FacetType.TYPES))
            .owners(getSearchFiltersForFacetType(state, FacetType.OWNERS))
            .namespaces(getSearchFiltersForFacetType(state, FacetType.NAMESPACES))
            .tags(getSearchFiltersForFacetType(state, FacetType.TAGS))
            .groups(getSearchFiltersForFacetType(state, FacetType.GROUPS))
            // The status facet is filtered on (FORM_MAPPINGS above) but was never echoed back, so the FE could
            // not reflect a selected status (chip) and the client's URL-driven search state could not resolve
            // to "synced". FacetState.statuses is a NOT_REQUIRED contract field — this is an additive fill.
            .statuses(getSearchFiltersForFacetType(state, FacetType.STATUSES));
    }

    private SearchFilterDto mapFilter(final SearchFilterState f, final FacetType type) {
        return SearchFilterDto.builder()
            .entityId(f.getEntityId())
            .entityName(f.getEntityName())
            .selected(f.getSelected())
            .type(type)
            // ST-11: an absent flag is a positive selection (every pre-ST-11 request)
            .exclude(Boolean.TRUE.equals(f.getExclude()))
            .build();
    }

    private List<SearchFilter> getSearchFiltersForFacetType(final FacetStateDto state, final FacetType facetType) {
        return state.getFacetEntities(facetType).stream()
            .map(searchMapper::mapDto)
            .collect(Collectors.toList());
    }
}
