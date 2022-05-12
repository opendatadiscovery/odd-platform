package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.jooq.Field;
import org.jooq.Insert;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.SelectConditionStep;
import org.jooq.Table;
import org.jooq.UpdateConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.Tables;
import org.opendatadiscovery.oddplatform.model.tables.records.SearchEntrypointRecord;
import org.opendatadiscovery.oddplatform.repository.util.FTSEntity;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.ReactiveJooqFTSHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.tables.DataSource.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.tables.SearchEntrypoint.SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConfig.FTS_CONFIG_DETAILS_MAP;

@Repository
@RequiredArgsConstructor
public class ReactiveSearchEntrypointRepositoryImpl implements ReactiveSearchEntrypointRepository {
    private final JooqReactiveOperations jooqReactiveOperations;
    private final ReactiveJooqFTSHelper jooqFTSHelper;

    @Override
    public Mono<Integer> updateChangedNamespaceVector(final long namespaceId) {
        final Field<Long> dataEntityId = field("data_entity_id", Long.class);

        final List<Field<?>> vectorFields = List.of(NAMESPACE.NAME);

        final SelectConditionStep<Record> vectorSelect = DSL
            .select(DATA_ENTITY.ID.as(dataEntityId))
            .select(vectorFields)
            .from(NAMESPACE)
            .join(DATA_SOURCE).on(DATA_SOURCE.NAMESPACE_ID.eq(NAMESPACE.ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.DATA_SOURCE_ID.eq(DATA_SOURCE.ID)).and(DATA_ENTITY.HOLLOW.isFalse())
            .where(NAMESPACE.ID.eq(namespaceId))
            .and(NAMESPACE.IS_DELETED.isFalse());

        final Insert<? extends Record> insertQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            dataEntityId,
            vectorFields,
            SEARCH_ENTRYPOINT.NAMESPACE_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.DATA_ENTITY),
            false
        );

        return jooqReactiveOperations.mono(insertQuery);
    }

    // Since data source -> data entity relation is 1-M and data entity record doesn't know anything about namespace
    // by itself but uses its relation to data source to retrieve a namespace,
    // we can clear the namespace vector of data entities by theirs data source id
    @Override
    public Mono<Integer> clearNamespaceVector(final long dataSourceId) {
        final SelectConditionStep<Record1<Long>> deIdSelect = DSL.select(DATA_ENTITY.ID)
            .from(DATA_ENTITY)
            .join(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
            .where(DATA_SOURCE.ID.eq(dataSourceId));

        final Table<Record1<Long>> deCte = deIdSelect.asTable("t");

        final Map<Field<?>, Object> params =
            Map.of(SEARCH_ENTRYPOINT.NAMESPACE_VECTOR, DSL.castNull(SEARCH_ENTRYPOINT.NAMESPACE_VECTOR));

        final UpdateConditionStep<SearchEntrypointRecord> updateQuery = DSL.with(deCte.getName())
            .as(deIdSelect)
            .update(SEARCH_ENTRYPOINT)
            .set(params)
            .from("t")
            .where(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(deCte.field(DATA_ENTITY.ID)));

        return jooqReactiveOperations.mono(updateQuery);
    }

    @Override
    public Mono<Integer> updateDataSourceVector(final long dataSourceId) {
        final Field<Long> deId = field("data_entity_id", Long.class);

        final List<Field<?>> dsVectorFields = List.of(DATA_SOURCE.NAME, DATA_SOURCE.CONNECTION_URL, DATA_SOURCE.ODDRN);

        final SelectConditionStep<Record> dsSelect = DSL
            .select(DATA_ENTITY.ID.as(deId))
            .select(dsVectorFields)
            .from(DATA_SOURCE)
            .join(DATA_ENTITY).on(DATA_ENTITY.DATA_SOURCE_ID.eq(DATA_SOURCE.ID)).and(DATA_ENTITY.HOLLOW.isFalse())
            .where(DATA_SOURCE.ID.eq(dataSourceId))
            .and(DATA_SOURCE.IS_DELETED.isFalse());

        final Insert<? extends Record> dataSourceQuery = jooqFTSHelper.buildVectorUpsert(
            dsSelect,
            deId,
            dsVectorFields,
            SEARCH_ENTRYPOINT.DATA_SOURCE_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.DATA_ENTITY),
            false
        );

        return jooqReactiveOperations.mono(dataSourceQuery);
    }

    /**
     * Calculates tag vector for particular data entity.
     */
    @Override
    public Mono<Integer> updateTagVectorsForDataEntity(final Long dataEntityId) {
        final Field<Long> deId = field("data_entity_id", Long.class);

        final List<Field<?>> vectorFields = List.of(TAG.NAME);

        final SelectConditionStep<Record> vectorSelect = DSL.select(vectorFields)
            .select(DATA_ENTITY.ID.as(deId))
            .from(TAG)
            .join(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.TAG_ID.eq(TAG.ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .where(DATA_ENTITY.ID.eq(dataEntityId))
            .and(TAG.IS_DELETED.isFalse());

        final Insert<? extends Record> tagQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            deId,
            vectorFields,
            SEARCH_ENTRYPOINT.TAG_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.DATA_ENTITY),
            true
        );

        return jooqReactiveOperations.mono(tagQuery);
    }

    /**
     * Recalculates tag vector for data entities with particular tag (in case of tag was renamed).
     */
    @Override
    public Mono<Integer> updateChangedTagVectors(final long tagId) {
        final Field<Long> dataEntityId = field("data_entity_id", Long.class);

        final List<Field<?>> vectorFields = List.of(TAG.NAME);

        final SelectConditionStep<Record> vectorSelect = DSL.select(vectorFields)
            .select(DATA_ENTITY.ID.as(dataEntityId))
            .from(TAG)
            .join(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.TAG_ID.eq(TAG.ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .where(TAG.ID.eq(tagId));

        final Insert<? extends Record> tagQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            dataEntityId,
            vectorFields,
            SEARCH_ENTRYPOINT.TAG_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.DATA_ENTITY),
            true
        );

        return jooqReactiveOperations.mono(tagQuery);
    }

    @Override
    public Mono<Integer> updateChangedOwnerVectors(final long ownerId) {
        final Field<Long> dataEntityId = field("data_entity_id", Long.class);

        final Field<String> ownerNameAlias = field("owner_name", String.class);
        final Field<String> roleNameAlias = field("role_name", String.class);

        final List<Field<?>> vectorFields = List.of(
            OWNER.NAME.as(ownerNameAlias),
            ROLE.NAME.as(roleNameAlias)
        );

        final SelectConditionStep<Record> vectorSelect = DSL.select(vectorFields)
            .select(DATA_ENTITY.ID.as(dataEntityId))
            .from(OWNER)
            .join(OWNERSHIP).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .join(ROLE).on(ROLE.ID.eq(OWNERSHIP.ROLE_ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(OWNERSHIP.DATA_ENTITY_ID))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .where(OWNER.ID.eq(ownerId));

        final Insert<? extends Record> ownerQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            dataEntityId,
            vectorFields,
            SEARCH_ENTRYPOINT.OWNER_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.DATA_ENTITY),
            true,
            Map.of(ownerNameAlias, OWNER.NAME, roleNameAlias, ROLE.NAME)
        );

        return jooqReactiveOperations.mono(ownerQuery);
    }

    @Override
    public Mono<Integer> updateChangedOwnershipVectors(final long ownershipId) {
        final Field<Long> dataEntityId = field("data_entity_id", Long.class);

        final Field<String> ownerNameAlias = field("owner_name", String.class);
        final Field<String> roleNameAlias = field("role_name", String.class);

        final List<Field<?>> vectorFields = List.of(
            OWNER.NAME.as(ownerNameAlias),
            ROLE.NAME.as(roleNameAlias)
        );

        final SelectConditionStep<Record> vectorSelect = DSL.select(vectorFields)
            .select(DATA_ENTITY.ID.as(dataEntityId))
            .from(OWNER)
            .join(OWNERSHIP).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .join(ROLE).on(ROLE.ID.eq(OWNERSHIP.ROLE_ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(OWNERSHIP.DATA_ENTITY_ID))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .where(OWNERSHIP.ID.eq(ownershipId));

        final Insert<? extends Record> ownershipQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            dataEntityId,
            vectorFields,
            Tables.SEARCH_ENTRYPOINT.OWNER_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.DATA_ENTITY),
            true,
            Map.of(ownerNameAlias, OWNER.NAME, roleNameAlias, ROLE.NAME)
        );

        return jooqReactiveOperations.mono(ownershipQuery);
    }
}
