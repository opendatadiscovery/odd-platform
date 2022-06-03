package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.jooq.Field;
import org.jooq.Insert;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.repository.util.FTSEntity;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.ReactiveJooqFTSHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConfig.FTS_CONFIG_DETAILS_MAP;

@Repository
@RequiredArgsConstructor
public class ReactiveTermSearchEntrypointRepositoryImpl implements ReactiveTermSearchEntrypointRepository {

    private final JooqReactiveOperations jooqReactiveOperations;
    private final ReactiveJooqFTSHelper jooqFTSHelper;

    @Override
    public Mono<Integer> updateTermVectors(final long termId) {
        final Field<Long> termIdField = field("term_id", Long.class);

        final List<Field<?>> vectorFields = List.of(
            TERM.NAME,
            TERM.DEFINITION
        );

        final SelectConditionStep<Record> vectorSelect = DSL
            .select(vectorFields)
            .select(TERM.ID.as(termIdField))
            .from(TERM)
            .where(TERM.ID.eq(termId));

        final Insert<? extends Record> insertQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            termIdField,
            vectorFields,
            TERM_SEARCH_ENTRYPOINT.TERM_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.TERM)
        );

        return jooqReactiveOperations.mono(insertQuery);
    }

    @Override
    public Mono<Integer> updateChangedNamespaceVector(final long namespaceId) {
        final Field<Long> termIdField = field("term_id", Long.class);

        final List<Field<?>> vectorFields = List.of(NAMESPACE.NAME);

        final SelectConditionStep<Record> vectorSelect = DSL
            .select(TERM.ID.as(termIdField))
            .select(vectorFields)
            .from(NAMESPACE)
            .join(TERM).on(TERM.NAMESPACE_ID.eq(NAMESPACE.ID)).and(TERM.DELETED_AT.isNull())
            .where(NAMESPACE.ID.eq(namespaceId));

        final Insert<? extends Record> insertQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            termIdField,
            vectorFields,
            TERM_SEARCH_ENTRYPOINT.NAMESPACE_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.TERM)
        );

        return jooqReactiveOperations.mono(insertQuery);
    }

    @Override
    public Mono<Integer> updateNamespaceVectorsForTerm(final long termId) {
        final Field<Long> termIdField = field("term_id", Long.class);

        final List<Field<?>> vectorFields = List.of(NAMESPACE.NAME);

        final SelectConditionStep<Record> vectorSelect = DSL
            .select(vectorFields)
            .select(TERM.ID.as(termIdField))
            .from(TERM)
            .join(NAMESPACE).on(NAMESPACE.ID.eq(TERM.NAMESPACE_ID))
            .where(TERM.ID.eq(termId));

        final Insert<? extends Record> insertQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            termIdField,
            vectorFields,
            TERM_SEARCH_ENTRYPOINT.NAMESPACE_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.TERM)
        );

        return jooqReactiveOperations.mono(insertQuery);
    }

    @Override
    public Mono<Integer> updateTagVectorsForTerm(final long termId) {
        final Field<Long> termIdField = field("term_id", Long.class);

        final List<Field<?>> vectorFields = List.of(TAG.NAME);

        final SelectConditionStep<Record> vectorSelect = DSL
            .select(TERM.ID.as(termIdField))
            .select(vectorFields)
            .from(TERM)
            .leftJoin(TAG_TO_TERM).on(TAG_TO_TERM.TERM_ID.eq(TERM.ID).and(TAG_TO_TERM.DELETED_AT.isNull()))
            .leftJoin(TAG).on(TAG.ID.eq(TAG_TO_TERM.TAG_ID))
            .where(TERM.ID.eq(termId));

        final Insert<? extends Record> insert = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            termIdField,
            vectorFields,
            TERM_SEARCH_ENTRYPOINT.TAG_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.TERM),
            true);

        return jooqReactiveOperations.mono(insert);
    }

    @Override
    public Mono<Integer> updateChangedTagVectors(final long tagId) {
        final Field<Long> termIdField = field("term_id", Long.class);

        final List<Field<?>> vectorFields = List.of(TAG.NAME);

        final var cteSelect = DSL.select(TAG_TO_TERM.TERM_ID)
            .from(TAG_TO_TERM)
            .join(TERM).on(TERM.ID.eq(TAG_TO_TERM.TERM_ID).and(TERM.DELETED_AT.isNull()))
            .where(TAG_TO_TERM.TAG_ID.eq(tagId));

        final Table<? extends Record> cte = cteSelect.asTable("cte");

        final var vectorSelect = DSL.with(cte.getName())
            .as(cteSelect)
            .select(TERM.ID.as(termIdField))
            .select(vectorFields)
            .from(TERM)
            .join(cte).on(cte.field(termIdField).eq(TERM.ID))
            .leftJoin(TAG_TO_TERM).on(TAG_TO_TERM.TERM_ID.eq(TERM.ID).and(TAG_TO_TERM.DELETED_AT.isNull()))
            .leftJoin(TAG).on(TAG.ID.eq(TAG_TO_TERM.TAG_ID));

        final Insert<? extends Record> insert = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            termIdField,
            vectorFields,
            TERM_SEARCH_ENTRYPOINT.TAG_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.TERM),
            true);

        return jooqReactiveOperations.mono(insert);
    }

    @Override
    public Mono<Integer> updateChangedOwnershipVectors(final long ownershipId) {
        final Field<Long> termIdField = field("term_id", Long.class);

        final Field<String> ownerNameAlias = field("owner_name", String.class);
        final Field<String> roleNameAlias = field("role_name", String.class);

        final List<Field<?>> vectorFields = List.of(
            OWNER.NAME.as(ownerNameAlias),
            ROLE.NAME.as(roleNameAlias)
        );

        final var cteSelect = DSL.select(TERM_OWNERSHIP.TERM_ID)
            .from(TERM_OWNERSHIP)
            .join(TERM).on(TERM.ID.eq(TERM_OWNERSHIP.TERM_ID).and(TERM.DELETED_AT.isNull()))
            .where(TERM_OWNERSHIP.ID.eq(ownershipId));

        final Table<? extends Record> cte = cteSelect.asTable("cte");

        final var vectorSelect = DSL.with(cte.getName())
            .as(cteSelect)
            .select(TERM.ID.as(termIdField))
            .select(vectorFields)
            .from(TERM)
            .join(cte).on(cte.field(termIdField).eq(TERM.ID))
            .leftJoin(TERM_OWNERSHIP).on(TERM_OWNERSHIP.TERM_ID.eq(TERM.ID).and(TERM_OWNERSHIP.DELETED_AT.isNull()))
            .leftJoin(ROLE).on(ROLE.ID.eq(TERM_OWNERSHIP.ROLE_ID))
            .leftJoin(OWNER).on(OWNER.ID.eq(TERM_OWNERSHIP.OWNER_ID));

        final Insert<? extends Record> ownershipQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            termIdField,
            vectorFields,
            TERM_SEARCH_ENTRYPOINT.OWNER_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.TERM),
            true,
            Map.of(ownerNameAlias, OWNER.NAME, roleNameAlias, ROLE.NAME)
        );

        return jooqReactiveOperations.mono(ownershipQuery);
    }

    @Override
    public Mono<Integer> updateChangedOwnerVectors(final long ownerId) {
        final Field<Long> termIdField = field("term_id", Long.class);

        final Field<String> ownerNameAlias = field("owner_name", String.class);
        final Field<String> roleNameAlias = field("role_name", String.class);

        final List<Field<?>> vectorFields = List.of(
            OWNER.NAME.as(ownerNameAlias),
            ROLE.NAME.as(roleNameAlias)
        );

        final var cteSelect = DSL.select(TERM_OWNERSHIP.TERM_ID)
            .from(TERM_OWNERSHIP)
            .join(TERM).on(TERM.ID.eq(TERM_OWNERSHIP.TERM_ID).and(TERM.DELETED_AT.isNull()))
            .where(TERM_OWNERSHIP.OWNER_ID.eq(ownerId));

        final Table<? extends Record> cte = cteSelect.asTable("cte");

        final var vectorSelect = DSL.with(cte.getName())
            .as(cteSelect)
            .select(TERM.ID.as(termIdField))
            .select(vectorFields)
            .from(TERM)
            .join(cte).on(cte.field(termIdField).eq(TERM.ID))
            .leftJoin(TERM_OWNERSHIP).on(TERM_OWNERSHIP.TERM_ID.eq(TERM.ID).and(TERM_OWNERSHIP.DELETED_AT.isNull()))
            .leftJoin(ROLE).on(ROLE.ID.eq(TERM_OWNERSHIP.ROLE_ID))
            .leftJoin(OWNER).on(OWNER.ID.eq(TERM_OWNERSHIP.OWNER_ID));

        final Insert<? extends Record> ownershipQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            termIdField,
            vectorFields,
            TERM_SEARCH_ENTRYPOINT.OWNER_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.TERM),
            true,
            Map.of(ownerNameAlias, OWNER.NAME, roleNameAlias, ROLE.NAME)
        );

        return jooqReactiveOperations.mono(ownershipQuery);
    }
}
