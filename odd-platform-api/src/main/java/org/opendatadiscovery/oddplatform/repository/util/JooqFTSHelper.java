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
import org.jooq.Insert;
import org.jooq.Record;
import org.jooq.Record2;
import org.jooq.Select;
import org.jooq.SelectJoinStep;
import org.jooq.Table;
import org.jooq.TableField;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

import static java.util.Collections.emptyMap;
import static java.util.Objects.requireNonNull;
import static java.util.function.Predicate.not;
import static org.jooq.impl.DSL.coalesce;
import static org.jooq.impl.DSL.condition;
import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.DATA_ENTITY_CONDITIONS;

@Component
@RequiredArgsConstructor
@Slf4j
public class JooqFTSHelper {

    public Insert<? extends Record> buildVectorUpsert(
        final Select<? extends Record> vectorSelect,
        final Field<Long> dataEntityIdField,
        final List<Field<?>> vectorFields,
        final TableField<? extends Record, Object> seTargetField,
        final FTSConfig.FTSConfigDetails ftsConfigDetails
    ) {
        return buildVectorUpsert(vectorSelect, dataEntityIdField,
            vectorFields, seTargetField, ftsConfigDetails, false, emptyMap());
    }

    public Insert<? extends Record> buildVectorUpsert(
        final Select<? extends Record> vectorSelect,
        final Field<Long> dataEntityIdField,
        final List<Field<?>> vectorFields,
        final TableField<? extends Record, Object> seTargetField,
        final FTSConfig.FTSConfigDetails ftsConfigDetails,
        final boolean agg
    ) {
        return buildVectorUpsert(vectorSelect, dataEntityIdField,
            vectorFields, seTargetField, ftsConfigDetails, agg, emptyMap());
    }

    public Insert<? extends Record> buildVectorUpsert(
        final Select<? extends Record> vectorSelect,
        final Field<Long> idField,
        final List<Field<?>> vectorFields,
        final TableField<? extends Record, Object> seTargetField,
        final FTSConfig.FTSConfigDetails ftsConfigDetails,
        final boolean agg,
        final Map<Field<?>, Field<?>> remappingConfig) {
        if (vectorFields.isEmpty()) {
            throw new IllegalArgumentException("Vector fields collection must not be empty");
        }

        final Table<? extends Record> cte = vectorSelect.asTable("t");

        final Field<Object> vector = concatVectorFields(cte, vectorFields, agg, ftsConfigDetails.ftsWeights(),
            remappingConfig).as(seTargetField);

        final Field<Long> cteId = cte.field(idField);

        Select<Record2<Long, Object>> insertQuery = DSL
            .select(cteId, vector)
            .from(cte.getUnqualifiedName());

        if (agg) {
            insertQuery = ((SelectJoinStep<Record2<Long, Object>>) insertQuery).groupBy(cteId);
        }

        return DSL.with(cte.getName())
            .as(vectorSelect)
            .insertInto(ftsConfigDetails.vectorTable(), ftsConfigDetails.vectorTableIdField(), seTargetField)
            .select(insertQuery)
            .onConflict().doUpdate().set(onConflictSetMap(seTargetField));
    }

    public Condition ftsCondition(final Field<?> vectorField,
                                  final String plainQuery) {
        final String query = tsQuery(plainQuery);
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

    public Pair<List<Condition>, List<Condition>> resultFacetStateConditions(final FacetStateDto state) {
        final Predicate<Map.Entry<FacetType, List<SearchFilterDto>>> cteFilters =
            e -> e.getKey().equals(FacetType.DATA_SOURCES)
                || e.getKey().equals(FacetType.ENTITY_CLASSES)
                || e.getKey().equals(FacetType.TYPES);

        final List<Condition> joinConditions = state.getState().entrySet().stream()
            .filter(not(cteFilters))
            .map(e -> compileFacetCondition(e.getKey(), e.getValue(), DATA_ENTITY_CONDITIONS))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        final List<Condition> cteConditions = state.getState().entrySet().stream()
            .filter(cteFilters)
            .filter(e -> {
                if (state.isMyObjects()) {
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

    public Field<?> ftsRankField(final Field<?> vectorField, final String plainQuery) {
        requireNonNull(vectorField);
        final String query = tsQuery(plainQuery);
        return field(
            "ts_rank(?, to_tsquery(?))",
            vectorField,
            query
        );
    }

    public String tsQuery(final String plainQuery) {
        return Arrays.stream(plainQuery.split(" "))
            .map(queryPart -> queryPart + ":*")
            .collect(Collectors.joining("&"));
    }

    private Condition compileFacetCondition(final FacetType facetType,
                                            final List<SearchFilterDto> filters,
                                            final Map<FacetType, Function<List<SearchFilterDto>, Condition>> facetMap) {
        final Function<List<SearchFilterDto>, Condition> function = facetMap.get(facetType);
        if (function == null || CollectionUtils.isEmpty(filters)) {
            return null;
        }
        return function.apply(filters);
    }

    private Field<Object> concatVectorFields(final Table<? extends Record> cte,
                                             final List<Field<?>> vectorFields,
                                             final boolean agg,
                                             final Map<Field<?>, String> weightsMap,
                                             final Map<Field<?>, Field<?>> remappingConfig) {
        final String expr = vectorFields.stream()
            .map(f -> getWeightRelation(f, weightsMap, cte, remappingConfig))
            .filter(Objects::nonNull)
            .map(p -> String.format("setweight(to_tsvector(%s), '%s')", p.getLeft(), p.getRight()))
            .collect(Collectors.joining(" || "));

        // 'tsvector_agg' is a custom aggregate function defined in V0_0_14__normalize_fts_process.sql migration
        return agg ? field(String.format("tsvector_agg(%s)", expr)) : field(expr);
    }

    private static Pair<Field<?>, String> getWeightRelation(final Field<?> field,
                                                            final Map<Field<?>, String> weightsMap,
                                                            final Table<? extends Record> cte,
                                                            final Map<Field<?>, Field<?>> remappingConfig) {
        final String weight = weightsMap.get(field);
        final Field<?> coalesce = coalesce(cte.field(field), "");

        if (weight == null) {
            final Field<?> remappedField = remappingConfig.get(field);
            if (remappedField == null) {
                log.warn("Couldn't find weight nor remapped field in the config for the: {}", field);
                return null;
            }

            final String remappedFieldWeight = weightsMap.get(remappedField);

            if (remappedFieldWeight == null) {
                log.warn("Couldn't find weight neither for the remapped field {} nor the original {}",
                    remappedField, field);
                return null;
            }
            return Pair.of(coalesce, remappedFieldWeight);
        }
        return Pair.of(coalesce, weight);
    }

    private static Map<Field<?>, Field<?>> onConflictSetMap(final Field<?> targetField) {
        return Map.of(targetField, field(String.format("excluded.%s", targetField.getName())));
    }
}
