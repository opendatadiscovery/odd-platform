package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.Field;
import org.jooq.Insert;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.model.Tables;
import org.opendatadiscovery.oddplatform.repository.util.FTSEntity;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.LOOKUP_TABLES;
import static org.opendatadiscovery.oddplatform.model.Tables.LOOKUP_TABLES_DEFINITIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.LOOKUP_TABLES_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConfig.FTS_CONFIG_DETAILS_MAP;

@Repository
@RequiredArgsConstructor
public class ReactiveLookupTableSearchEntrypointRepositoryImpl
    implements ReactiveLookupTableSearchEntrypointRepository {
    private static final int SUGGESTION_LIMIT = 5;

    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqFTSHelper jooqFTSHelper;

    @Override
    @ReactiveTransactional
    public Mono<Integer> updateLookupTableVectors(final Long tableId) {
        final Field<Long> lookupTableId = field("lookup_table_id", Long.class);

        final List<Field<?>> vectorFields = List.of(
            LOOKUP_TABLES.NAME,
            LOOKUP_TABLES.DESCRIPTION
        );

        final SelectConditionStep<Record> vectorSelect = DSL
            .select(vectorFields)
            .select(LOOKUP_TABLES.ID.as(lookupTableId))
            .from(LOOKUP_TABLES)
            .where(LOOKUP_TABLES.ID.eq(tableId));

        final Insert<? extends Record> insertQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            lookupTableId,
            vectorFields,
            LOOKUP_TABLES_SEARCH_ENTRYPOINT.LOOKUP_TABLE_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.LOOKUP_TABLES)
        );

        return jooqReactiveOperations.mono(insertQuery);
    }

    @Override
    @ReactiveTransactional
    public Mono<Integer> updateNamespaceSearchVectors(final Long tableId) {
        final Field<Long> lookupTableId = field("lookup_table_id", Long.class);

        final List<Field<?>> vectorFields = List.of(NAMESPACE.NAME);

        final var vectorSelect = DSL.select(LOOKUP_TABLES.ID.as(lookupTableId))
            .select(vectorFields)
            .from(LOOKUP_TABLES)
            .join(NAMESPACE).on(NAMESPACE.ID.eq(LOOKUP_TABLES.NAMESPACE_ID).and(NAMESPACE.DELETED_AT.isNull()))
            .where(LOOKUP_TABLES.ID.eq(tableId));

        final Insert<? extends Record> insertQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            lookupTableId,
            vectorFields,
            LOOKUP_TABLES_SEARCH_ENTRYPOINT.NAMESPACE_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.LOOKUP_TABLES)
        );

        return jooqReactiveOperations.mono(insertQuery);
    }

    @Override
    @ReactiveTransactional
    public Mono<Integer> updateTableDefinitionSearchVectors(final Long tableId) {
        final Field<Long> lookupTableId = field("lookup_table_id", Long.class);

        final List<Field<?>> vectorFields = List.of(LOOKUP_TABLES_DEFINITIONS.COLUMN_NAME);

        final var vectorSelect = DSL.select(LOOKUP_TABLES.ID.as(lookupTableId))
            .select(vectorFields)
            .from(LOOKUP_TABLES)
            .join(Tables.LOOKUP_TABLES_DEFINITIONS)
            .on(LOOKUP_TABLES_DEFINITIONS.LOOKUP_TABLE_ID.eq(LOOKUP_TABLES.ID))
            .where(LOOKUP_TABLES.ID.eq(tableId));

        final Insert<? extends Record> insertQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            lookupTableId,
            vectorFields,
            LOOKUP_TABLES_SEARCH_ENTRYPOINT.LOOKUP_TABLE_DEFENITION_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.LOOKUP_TABLES),
            true
        );

        return jooqReactiveOperations.mono(insertQuery);
    }
}
