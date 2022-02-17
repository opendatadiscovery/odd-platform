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
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD_VALUE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;

@Component
@RequiredArgsConstructor
@Slf4j
public class JooqFTSHelper {
    private static final Map<Field<?>, String> FTS_WEIGHTS = Map.ofEntries(
        Map.entry(DATA_ENTITY.INTERNAL_NAME, "A"),
        Map.entry(DATA_ENTITY.EXTERNAL_NAME, "A"),
        Map.entry(DATA_ENTITY.INTERNAL_DESCRIPTION, "B"),
        Map.entry(DATA_ENTITY.EXTERNAL_DESCRIPTION, "B"),
        Map.entry(DATA_SOURCE.NAME, "B"),
        Map.entry(DATA_SOURCE.ODDRN, "D"),
        Map.entry(DATA_SOURCE.CONNECTION_URL, "D"),
        Map.entry(NAMESPACE.NAME, "B"),
        Map.entry(TAG.NAME, "B"),
        Map.entry(METADATA_FIELD.NAME, "C"),
        Map.entry(METADATA_FIELD_VALUE.VALUE, "D"),
        Map.entry(DATASET_FIELD.NAME, "C"),
        Map.entry(DATASET_FIELD.INTERNAL_DESCRIPTION, "C"),
        Map.entry(DATASET_FIELD.EXTERNAL_DESCRIPTION, "C"),
        Map.entry(LABEL.NAME, "C"),
        Map.entry(ROLE.NAME, "D"),
        Map.entry(OWNER.NAME, "C")
    );

    private static final Map<FacetType, Function<List<SearchFilterDto>, Condition>> CONDITIONS = Map.of(
        FacetType.TYPES, filters -> DATA_ENTITY.TYPE_IDS
            .contains(extractFilterId(filters).stream().map(Long::intValue).toArray(Integer[]::new)),
        FacetType.DATA_SOURCES, filters -> DATA_ENTITY.DATA_SOURCE_ID.in(extractFilterId(filters))
    );

    private static final Map<FacetType, Function<List<SearchFilterDto>, Condition>> EXTENDED_CONDITIONS = Map.of(
        FacetType.TYPES, filters -> DATA_ENTITY.TYPE_IDS
            .contains(extractFilterId(filters).stream().map(Long::intValue).toArray(Integer[]::new)),
        FacetType.DATA_SOURCES, filters -> DATA_ENTITY.DATA_SOURCE_ID.in(extractFilterId(filters)),
        FacetType.NAMESPACES, filters -> DATA_SOURCE.NAMESPACE_ID.in(extractFilterId(filters)),
        FacetType.SUBTYPES, filters -> DATA_ENTITY.SUBTYPE_ID.in(extractFilterId(filters)),
        FacetType.OWNERS, filters -> OWNER.ID.in(extractFilterId(filters)),
        FacetType.TAGS, filters -> TAG.ID.in(extractFilterId(filters))
    );

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

    public Condition ftsCondition(final String plainQuery) {
        final String query = String.join("&", plainQuery.split(" "));

        final Field<Object> conditionField = field(
            "? @@ to_tsquery(?)",
            SEARCH_ENTRYPOINT.SEARCH_VECTOR,
            String.format("%s:*", query)
        );

        return condition(conditionField.toString());
    }

    public List<Condition> facetStateConditions(final FacetStateDto state,
                                                final boolean extended,
                                                final boolean skipTypeCondition) {
        return state.getState().entrySet().stream()
            .filter(e -> {
                if (skipTypeCondition) {
                    return !e.getKey().equals(FacetType.TYPES);
                }
                return true;
            })
            .map(e -> compileFacetCondition(e.getKey(), e.getValue(), extended))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    // TODO: ad-hoc
    public Pair<List<Condition>, List<Condition>> resultFacetStateConditions(final FacetStateDto state,
                                                                             final boolean skipTypeCondition) {
        final Predicate<Map.Entry<FacetType, List<SearchFilterDto>>> entryPredicate =
            e -> e.getKey().equals(FacetType.DATA_SOURCES)
                || e.getKey().equals(FacetType.TYPES)
                || e.getKey().equals(FacetType.SUBTYPES);

        final List<Condition> joinConditions = state.getState().entrySet().stream()
            .filter(not(entryPredicate))
            .map(e -> compileFacetCondition(e.getKey(), e.getValue(), true))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        final List<Condition> cteConditions = state.getState().entrySet().stream()
            .filter(entryPredicate)
            .filter(e -> {
                if (skipTypeCondition) {
                    return !e.getKey().equals(FacetType.TYPES);
                }

                return true;
            })
            .map(e -> compileFacetCondition(e.getKey(), e.getValue(), true))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        cteConditions.add(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()));

        return Pair.of(cteConditions, joinConditions);
    }

    public Condition compileFacetCondition(final FacetType facetType,
                                           final List<SearchFilterDto> filters,
                                           final boolean extended) {
        final Map<FacetType, Function<List<SearchFilterDto>, Condition>> conditionsDict = extended
            ? EXTENDED_CONDITIONS
            : CONDITIONS;

        final Function<List<SearchFilterDto>, Condition> function = conditionsDict.get(facetType);

        if (function == null || filters == null || filters.isEmpty()) {
            return null;
        }

        return function.apply(filters);
    }

    public Field<?> ftsRankField(final Field<?> vectorField, final String plainQuery) {
        requireNonNull(vectorField);

        final String query = String.join("&", plainQuery.split(" "));

        return field(
            "ts_rank(?, to_tsquery(?))",
            vectorField,
            String.format("%s:*", query)
        );
    }

    private static Field<Object> concatVectorFields(final Table<? extends Record> cte,
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
        final String weight = FTS_WEIGHTS.get(field);
        final Field<?> coalesce = coalesce(cte.field(field), "");

        if (weight == null) {
            final Field<?> remappedField = remappingConfig.get(field);
            if (remappedField == null) {
                log.warn("Couldn't find weight nor remapped field in the config for the: {}", field);
                return null;
            }

            final String remappedFieldWeight = FTS_WEIGHTS.get(remappedField);

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

    private static List<Long> extractFilterId(final List<SearchFilterDto> filters) {
        return filters.stream()
            .map(SearchFilterDto::getEntityId)
            .collect(Collectors.toList());
    }
}
