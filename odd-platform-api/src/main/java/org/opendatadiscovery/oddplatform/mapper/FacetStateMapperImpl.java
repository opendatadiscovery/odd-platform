package org.opendatadiscovery.oddplatform.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
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
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;

import static java.util.stream.Collectors.groupingBy;

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
            SearchFormDataFilters::getStatuses, FacetType.STATUSES,
            SearchFormDataFilters::getLastRunStatuses, FacetType.LAST_RUN_STATUSES,
            SearchFormDataFilters::getDataQualityRelations, FacetType.DATA_QUALITY_RELATION
        );

    private static final Map<Function<TermSearchFormDataFilters, List<SearchFilterState>>, FacetType>
        TERM_FORM_MAPPINGS =
        Map.of(
            TermSearchFormDataFilters::getNamespaces, FacetType.NAMESPACES,
            TermSearchFormDataFilters::getOwners, FacetType.OWNERS,
            TermSearchFormDataFilters::getTags, FacetType.TAGS
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
        if (filters == null) {
            return FacetStateDto.empty();
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
            formData.getMyObjects() != null ? formData.getMyObjects() : false
        );
    }

    @Override
    public FacetStateDto mapForm(final TermSearchFormData formData) {
        final TermSearchFormDataFilters filters = formData.getFilters();

        final Map<FacetType, List<SearchFilterDto>> state = TERM_FORM_MAPPINGS.entrySet().stream()
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
            false
        );
    }

    @Override
    public FacetStateDto mapForm(final QueryExampleSearchFormData formData) {
        return new FacetStateDto(
            Map.of(),
            formData.getQuery(),
            false
        );
    }

    @Override
    public FacetStateDto mapForm(final ReferenceDataSearchFormData formData) {
        return new FacetStateDto(
            Map.of(),
            formData.getQuery(),
            false
        );
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
            .statuses(getSearchFiltersForFacetType(state, FacetType.STATUSES))
            .lastRunStatuses(getSearchFiltersForFacetType(state, FacetType.LAST_RUN_STATUSES))
            .dataQualityRelations(getSearchFiltersForFacetType(state, FacetType.DATA_QUALITY_RELATION));
    }

    @Override
    public SearchFormData mapToFormData(final List<Long> namespaceIds,
                                        final List<Long> datasourceIds,
                                        final List<Long> ownerIds,
                                        final List<Long> tagIds,
                                        final List<Integer> entityClasses,
                                        final List<Integer> types) {
        final SearchFormDataFilters filters = new SearchFormDataFilters()
            .namespaces(getFilterStateList(namespaceIds, FacetType.NAMESPACES))
            .datasources(getFilterStateList(datasourceIds, FacetType.DATA_SOURCES))
            .owners(getFilterStateList(ownerIds, FacetType.OWNERS))
            .tags(getFilterStateList(tagIds, FacetType.TAGS))
            .entityClasses(getFilterStateListForEntityClasses(entityClasses))
            .types(getFilterStateListForType(types));

        return new SearchFormData().filters(filters).query("");
    }

    private List<SearchFilterState> getFilterStateList(final List<Long> filterIds, final FacetType filterType) {
        if (CollectionUtils.isEmpty(filterIds)) {
            return Collections.emptyList();
        }

        return filterIds.stream()
            .map(id -> new SearchFilterState()
                .entityId(id)
                .entityName(filterType.name())
                .selected(true))
            .collect(Collectors.toList());
    }

    private List<SearchFilterState> getFilterStateListForEntityClasses(final List<Integer> filterIds) {
        if (CollectionUtils.isEmpty(filterIds)) {
            return Collections.emptyList();
        }

        return filterIds.stream()
            .map(id -> new SearchFilterState()
                .entityId(Long.valueOf(id))
                .entityName(DataEntityClassDto.findById(id).orElseThrow(() -> new IllegalArgumentException(
                    "Unknown data entity class id: %d".formatted(id))).name())
                .selected(true))
            .collect(Collectors.toList());
    }

    private List<SearchFilterState> getFilterStateListForType(final List<Integer> filterIds) {
        if (CollectionUtils.isEmpty(filterIds)) {
            return Collections.emptyList();
        }

        return filterIds.stream()
            .map(id -> new SearchFilterState()
                .entityId(Long.valueOf(id))
                .entityName(DataEntityTypeDto.findById(id).orElseThrow(() -> new IllegalArgumentException(
                    "Unknown data entity type id: %d".formatted(id))).name())
                .selected(true))
            .collect(Collectors.toList());
    }

    private SearchFilterDto mapFilter(final SearchFilterState f, final FacetType type) {
        return SearchFilterDto.builder()
            .entityId(f.getEntityId())
            .entityName(f.getEntityName())
            .selected(f.getSelected())
            .type(type)
            .build();
    }

    private List<SearchFilter> getSearchFiltersForFacetType(final FacetStateDto state, final FacetType facetType) {
        return state.getFacetEntities(facetType).stream()
            .map(searchMapper::mapDto)
            .collect(Collectors.toList());
    }
}
