package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.jooq.Field;
import org.jooq.Insert;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
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
    public Mono<Integer> updateNamespaceVectors(final long termId) {
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
    public Mono<Integer> updateTagVectors(final long termId) {
        final Field<Long> termIdField = field("term_id", Long.class);

        final List<Field<?>> vectorFields = List.of(TAG.NAME);

        final SelectConditionStep<Record> vectorSelect = DSL.select(vectorFields)
            .select(TAG_TO_TERM.TERM_ID.as(termIdField))
            .from(TAG_TO_TERM)
            .join(TAG).on(TAG_TO_TERM.TAG_ID.eq(TAG.ID))
            .where(TAG_TO_TERM.TERM_ID.eq(termId))
            .and(TAG_TO_TERM.DELETED_AT.isNull());
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
    public Mono<Integer> updateOwnerVectors(final long termId, final long ownerId) {
        final Field<Long> termIdField = field("term_id", Long.class);

        final Field<String> ownerNameAlias = field("owner_name", String.class);
        final Field<String> roleNameAlias = field("role_name", String.class);

        final List<Field<?>> vectorFields = List.of(
            OWNER.NAME.as(ownerNameAlias),
            ROLE.NAME.as(roleNameAlias)
        );

        final SelectConditionStep<Record> vectorSelect = DSL.select(vectorFields)
            .select(TERM_OWNERSHIP.TERM_ID.as(termIdField))
            .from(TERM_OWNERSHIP)
            .join(OWNER).on(TERM_OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .join(ROLE).on(TERM_OWNERSHIP.ROLE_ID.eq(ROLE.ID))
            .where(TERM_OWNERSHIP.TERM_ID.eq(termId).and(TERM_OWNERSHIP.OWNER_ID.eq(ownerId))
                .and(TERM_OWNERSHIP.DELETED_AT.isNull()));
        final Insert<? extends Record> insert = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            termIdField,
            vectorFields,
            TERM_SEARCH_ENTRYPOINT.OWNER_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.TERM),
            true,
            Map.of(ownerNameAlias, OWNER.NAME, roleNameAlias, ROLE.NAME));

        return jooqReactiveOperations.mono(insert);
    }
}
