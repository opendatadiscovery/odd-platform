package org.opendatadiscovery.oddplatform.repository.util;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.jooq.Field;
import org.jooq.Insert;
import org.jooq.Record;
import org.jooq.Record2;
import org.jooq.Select;
import org.jooq.SelectJoinStep;
import org.jooq.Table;
import org.jooq.TableField;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

import static java.util.Collections.emptyMap;
import static org.jooq.impl.DSL.coalesce;
import static org.jooq.impl.DSL.field;

@Component
@Slf4j
public class ReactiveJooqFTSHelper {
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

    // A headless variant of the method, which construct query leveraging jOOQ's static DSL class
    // Used in the application's reactive part
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
