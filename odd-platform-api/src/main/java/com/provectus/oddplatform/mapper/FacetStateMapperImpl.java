package com.provectus.oddplatform.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.provectus.oddplatform.api.contract.model.CountableSearchFilter;
import com.provectus.oddplatform.api.contract.model.FacetState;
import com.provectus.oddplatform.api.contract.model.SearchFilter;
import com.provectus.oddplatform.api.contract.model.SearchFilterState;
import com.provectus.oddplatform.api.contract.model.SearchFormData;
import com.provectus.oddplatform.api.contract.model.SearchFormDataFilters;
import com.provectus.oddplatform.dto.FacetStateDto;
import com.provectus.oddplatform.dto.FacetType;
import com.provectus.oddplatform.dto.SearchFilterDto;
import com.provectus.oddplatform.model.tables.pojos.SearchFacetsPojo;
import com.provectus.oddplatform.utils.JSONSerDeUtils;
import lombok.RequiredArgsConstructor;
import org.jooq.JSONB;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.groupingBy;

@Component
@RequiredArgsConstructor
public class FacetStateMapperImpl implements FacetStateMapper {
    private final SearchMapper searchMapper;

    private final static Map<Function<SearchFormDataFilters, List<SearchFilterState>>, FacetType> FORM_MAPPINGS =
        Map.of(
            SearchFormDataFilters::getTypes, FacetType.TYPES,
            SearchFormDataFilters::getSubtypes, FacetType.SUBTYPES,
            SearchFormDataFilters::getDatasources, FacetType.DATA_SOURCES,
            SearchFormDataFilters::getOwners, FacetType.OWNERS,
            SearchFormDataFilters::getTags, FacetType.TAGS
        );

    @Override
    public SearchFacetsPojo mapStateToPojo(final FacetStateDto state) {
        return mapStateToPojo(null, state);
    }

    @Override
    public SearchFacetsPojo mapStateToPojo(final UUID searchId, final FacetStateDto state) {
        return new SearchFacetsPojo()
            .setId(searchId)
            .setQueryString(state.getQuery())
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
    public FacetStateDto pojoToState(final SearchFacetsPojo facetsRecord) {
        return JSONSerDeUtils.deserializeJson(facetsRecord.getFilters().data(), new TypeReference<FacetStateDto>() {
        });
    }

    @Override
    public FacetState mapDto(final List<CountableSearchFilter> types, final FacetStateDto state) {
        return new FacetState()
            .types(types)
            .datasources(getSearchFiltersForFacetType(state, FacetType.DATA_SOURCES))
            .subtypes(getSearchFiltersForFacetType(state, FacetType.SUBTYPES))
            .owners(getSearchFiltersForFacetType(state, FacetType.OWNERS))
            .tags(getSearchFiltersForFacetType(state, FacetType.TAGS));
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
