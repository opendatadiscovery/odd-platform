package org.opendatadiscovery.oddplatform.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.api.contract.model.CountableSearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.FacetState;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFilterState;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
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
    private final SearchMapper searchMapper;

    private static final Map<Function<SearchFormDataFilters, List<SearchFilterState>>, FacetType> FORM_MAPPINGS =
        Map.of(
            SearchFormDataFilters::getEntityClasses, FacetType.ENTITY_CLASSES,
            SearchFormDataFilters::getTypes, FacetType.TYPES,
            SearchFormDataFilters::getDatasources, FacetType.DATA_SOURCES,
            SearchFormDataFilters::getNamespaces, FacetType.NAMESPACES,
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
    public FacetState mapDto(final List<CountableSearchFilter> entityClasses, final FacetStateDto state) {
        return new FacetState()
            .entityClasses(entityClasses)
            .datasources(getSearchFiltersForFacetType(state, FacetType.DATA_SOURCES))
            .types(getSearchFiltersForFacetType(state, FacetType.TYPES))
            .owners(getSearchFiltersForFacetType(state, FacetType.OWNERS))
            .namespaces(getSearchFiltersForFacetType(state, FacetType.NAMESPACES))
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
