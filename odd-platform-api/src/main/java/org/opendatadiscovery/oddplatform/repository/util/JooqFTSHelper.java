package org.opendatadiscovery.oddplatform.repository.util;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.Nullable;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Insert;
import org.jooq.Record;
import org.jooq.Record2;
import org.jooq.Select;
import org.jooq.SelectJoinStep;
import org.jooq.Table;
import org.jooq.TableField;
import org.opendatadiscovery.oddplatform.model.tables.records.SearchEntrypointRecord;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

import static java.util.Collections.emptyMap;
import static org.jooq.impl.DSL.coalesce;
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
    private static final Map<Field<?>, String> WEIGHTS = Map.ofEntries(
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
        final String weight = WEIGHTS.get(field);
        final Field<?> coalesce = coalesce(cte.field(field), "");

        if (weight == null) {
            final Field<?> remappedField = remappingConfig.get(field);
            if (remappedField == null) {
                log.warn("Couldn't find weight nor remapped field in the config for the: {}", field);
                return null;
            }

            final String remappedFieldWeight = WEIGHTS.get(remappedField);

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
