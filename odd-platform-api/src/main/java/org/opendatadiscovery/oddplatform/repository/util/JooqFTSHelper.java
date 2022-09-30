package org.opendatadiscovery.oddplatform.repository.util;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

import static java.util.Objects.requireNonNull;
import static java.util.function.Predicate.not;
import static org.jooq.impl.DSL.condition;
import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.DATA_ENTITY_CONDITIONS;

@Component
@RequiredArgsConstructor
@Slf4j
public class JooqFTSHelper {
    public Condition ftsCondition(final Field<?> vectorField,
                                  final String plainQuery) {
        final String query = Arrays.stream(plainQuery.split(" "))
            .map(queryPart -> queryPart + ":*")
            .collect(Collectors.joining("&"));

        final Field<Object> conditionField = field("? @@ to_tsquery(?)", vectorField, query);

        return condition(conditionField.toString());
    }

    public List<Condition> facetStateConditions(
        final FacetStateDto state,
        final Map<FacetType, Function<List<SearchFilterDto>, Condition>> facetTypeFunctionMap) {
        return facetStateConditions(state, facetTypeFunctionMap, List.of());
    }

    public List<Condition> facetStateConditions(
        final FacetStateDto state,
        final Map<FacetType, Function<List<SearchFilterDto>, Condition>> facetTypeFunctionMap,
        final List<FacetType> ignoredFacets) {
        return state.getState().entrySet().stream()
            .filter(e -> !ignoredFacets.contains(e.getKey()))
            .map(e -> compileFacetCondition(e.getKey(), e.getValue(), facetTypeFunctionMap))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    // TODO: ad-hoc
    public Pair<List<Condition>, List<Condition>> resultFacetStateConditions(final FacetStateDto state,
                                                                             final boolean skipEntityClassCondition) {
        final Predicate<Map.Entry<FacetType, List<SearchFilterDto>>> entryPredicate =
            e -> e.getKey().equals(FacetType.DATA_SOURCES)
                || e.getKey().equals(FacetType.ENTITY_CLASSES)
                || e.getKey().equals(FacetType.TYPES);

        final List<Condition> joinConditions = state.getState().entrySet().stream()
            .filter(not(entryPredicate))
            .map(e -> compileFacetCondition(e.getKey(), e.getValue(), DATA_ENTITY_CONDITIONS))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        final List<Condition> cteConditions = state.getState().entrySet().stream()
            .filter(entryPredicate)
            .filter(e -> {
                if (skipEntityClassCondition) {
                    return !e.getKey().equals(FacetType.ENTITY_CLASSES);
                }

                return true;
            })
            .map(e -> compileFacetCondition(e.getKey(), e.getValue(), DATA_ENTITY_CONDITIONS))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        cteConditions.add(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()));

        return Pair.of(cteConditions, joinConditions);
    }

    public Condition compileFacetCondition(final FacetType facetType,
                                           final List<SearchFilterDto> filters,
                                           final Map<FacetType, Function<List<SearchFilterDto>, Condition>> facetMap) {
        final Function<List<SearchFilterDto>, Condition> function = facetMap.get(facetType);
        if (function == null || CollectionUtils.isEmpty(filters)) {
            return null;
        }
        return function.apply(filters);
    }

    public Field<?> ftsRankField(final Field<?> vectorField, final String plainQuery) {
        requireNonNull(vectorField);

        final String query = Arrays.stream(plainQuery.split(" "))
            .map(queryPart -> queryPart + ":*")
            .collect(Collectors.joining("&"));

        return field(
            "ts_rank(?, to_tsquery(?))",
            vectorField,
            query
        );
    }
}
