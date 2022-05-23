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
import org.jetbrains.annotations.Nullable;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Insert;
import org.jooq.Record;
import org.jooq.Record2;
import org.jooq.Select;
import org.jooq.SelectJoinStep;
import org.jooq.Table;
import org.jooq.TableField;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;
import org.opendatadiscovery.oddplatform.model.tables.records.SearchEntrypointRecord;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

import static java.util.Collections.emptyMap;
import static java.util.Objects.requireNonNull;
import static java.util.function.Predicate.not;
import static org.jooq.impl.DSL.coalesce;
import static org.jooq.impl.DSL.condition;
import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.DATA_ENTITY_CONDITIONS;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.DATA_ENTITY_FTS_WEIGHTS;

@Component
@RequiredArgsConstructor
@Slf4j
public class JooqFTSHelper {

    private final DSLContext dslContext;

    public Insert<SearchEntrypointRecord> buildSearchEntrypointUpsert(
        final Select<? extends Record> vectorSelect,
        final Field<Long> dataEntityIdField,
        final List<Field<?>> vectorFields,
        final TableField<SearchEntrypointRecord, Object> seTargetField
    ) {
        return buildSearchEntrypointUpsert(vectorSelect, dataEntityIdField,
            vectorFields, seTargetField, false, emptyMap());
    }

    public Insert<SearchEntrypointRecord> buildSearchEntrypointUpsert(
        final Select<? extends Record> vectorSelect,
        final Field<Long> dataEntityIdField,
        final List<Field<?>> vectorFields,
        final TableField<SearchEntrypointRecord, Object> seTargetField,
        final boolean agg
    ) {
        return buildSearchEntrypointUpsert(vectorSelect, dataEntityIdField,
            vectorFields, seTargetField, agg, emptyMap());
    }

    // TODO: remove this method after full migration the reactive paradigm
    public Insert<SearchEntrypointRecord> buildSearchEntrypointUpsert(
        final Select<? extends Record> vectorSelect,
        final Field<Long> dataEntityIdField,
        final List<Field<?>> vectorFields,
        final TableField<SearchEntrypointRecord, Object> seTargetField,
        final boolean agg,
        final Map<Field<?>, Field<?>> remappingConfig
    ) {
        if (vectorFields.isEmpty()) {
            throw new IllegalArgumentException("Vector fields collection must not be empty");
        }

        final Table<? extends Record> deCte = vectorSelect.asTable("t");

        final Field<Object> vector = concatVectorFields(deCte, vectorFields, agg, remappingConfig).as(seTargetField);

        final Field<Long> cteDataEntityId = deCte.field(dataEntityIdField);

        Select<Record2<Long, Object>> insertQuery = dslContext
            .select(cteDataEntityId, vector)
            .from(deCte.getUnqualifiedName());

        if (agg) {
            insertQuery = ((SelectJoinStep<Record2<Long, Object>>) insertQuery).groupBy(cteDataEntityId);
        }

        return dslContext.with(deCte.getName())
            .as(vectorSelect)
            .insertInto(SEARCH_ENTRYPOINT, SEARCH_ENTRYPOINT.DATA_ENTITY_ID, seTargetField)
            .select(insertQuery)
            .onConflict().doUpdate().set(JooqFTSHelper.onConflictSetMap(seTargetField));
    }

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

    private Field<Object> concatVectorFields(final Table<? extends Record> cte,
                                             final List<Field<?>> vectorFields,
                                             final boolean agg,
                                             final Map<Field<?>, Field<?>> remappingConfig) {
        final String expr = vectorFields.stream()
            .map(f -> getWeightRelation(f, cte, remappingConfig))
            .filter(Objects::nonNull)
            .map(p -> String.format("setweight(to_tsvector(%s), '%s')", p.getLeft(), p.getRight()))
            .collect(Collectors.joining(" || "));

        // 'tsvector_agg' is a custom aggregate function defined in V0_0_14__normalize_fts_process.sql migration
        return agg ? field(String.format("tsvector_agg(%s)", expr)) : field(expr);
    }

    @Nullable
    private static Pair<Field<?>, String> getWeightRelation(final Field<?> field,
                                                            final Table<? extends Record> cte,
                                                            final Map<Field<?>, Field<?>> remappingConfig) {
        final String weight = DATA_ENTITY_FTS_WEIGHTS.get(field);
        final Field<?> coalesce = coalesce(cte.field(field), "");

        if (weight == null) {
            final Field<?> remappedField = remappingConfig.get(field);
            if (remappedField == null) {
                log.warn("Couldn't find weight nor remapped field in the config for the: {}", field);
                return null;
            }

            final String remappedFieldWeight = DATA_ENTITY_FTS_WEIGHTS.get(remappedField);

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
