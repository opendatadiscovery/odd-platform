package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.jooq.Field;
import org.jooq.Insert;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Record3;
import org.jooq.SelectConditionStep;
import org.jooq.SelectHavingStep;
import org.jooq.SelectOnConditionStep;
import org.jooq.Table;
import org.jooq.UpdateConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.model.Tables;
import org.opendatadiscovery.oddplatform.model.tables.records.SearchEntrypointRecord;
import org.opendatadiscovery.oddplatform.repository.util.FTSEntity;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.ReactiveJooqFTSHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static java.util.Collections.singletonList;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.max;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_VERSION;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL_TO_DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD_VALUE;
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
    @ReactiveTransactional
    public Mono<Void> recalculateVectors(final List<Long> dataEntityIds) {
        return Mono.zip(
            updateDataEntityVectors(dataEntityIds),
            updateDataSourceVectorsForDataEntities(dataEntityIds),
            updateNamespaceVectorForDataEntities(dataEntityIds),
            updateMetadataVectors(dataEntityIds),
            updateStructureVectorForDataEntities(dataEntityIds),
            updateTagVectorsForDataEntities(dataEntityIds)
        ).then();
    }

    @Override
    public Mono<Integer> updateDataEntityVectors(final long dataEntityId) {
        return updateDataEntityVectors(singletonList(dataEntityId));
    }

    @Override
    public Mono<Integer> updateDataEntityVectors(final List<Long> dataEntityIds) {
        final Field<Long> dataEntityIdField = field("data_entity_id", Long.class);

        final List<Field<?>> vectorFields = List.of(
            DATA_ENTITY.EXTERNAL_NAME,
            DATA_ENTITY.INTERNAL_NAME,
            DATA_ENTITY.EXTERNAL_DESCRIPTION,
            DATA_ENTITY.INTERNAL_DESCRIPTION
        );

        final SelectConditionStep<Record> vectorSelect = DSL
            .select(vectorFields)
            .select(DATA_ENTITY.ID.as(dataEntityIdField))
            .from(DATA_ENTITY)
            .where(DATA_ENTITY.ID.in(dataEntityIds))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .and(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()));

        final Insert<? extends Record> insertQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            dataEntityIdField,
            vectorFields,
            SEARCH_ENTRYPOINT.DATA_ENTITY_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.DATA_ENTITY),
            false
        );

        return jooqReactiveOperations.mono(insertQuery);
    }

    @Override
    public Mono<Integer> updateDataSourceVectorsForDataEntities(final List<Long> dataEntityIds) {
        final Field<Long> dataEntityIdField = field("data_entity_id", Long.class);

        final List<Field<?>> vectorFields = List.of(
            Tables.DATA_SOURCE.NAME, Tables.DATA_SOURCE.CONNECTION_URL, Tables.DATA_SOURCE.ODDRN);

        final SelectConditionStep<Record> vectorSelect = DSL
            .select(DATA_ENTITY.ID.as(dataEntityIdField))
            .select(vectorFields)
            .from(Tables.DATA_SOURCE)
            .join(DATA_ENTITY).on(DATA_ENTITY.DATA_SOURCE_ID.eq(Tables.DATA_SOURCE.ID))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .and(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()))
            .where(DATA_ENTITY.ID.in(dataEntityIds))
            .and(DATA_SOURCE.IS_DELETED.isFalse());

        final Insert<? extends Record> insertQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            dataEntityIdField,
            vectorFields,
            SEARCH_ENTRYPOINT.DATA_SOURCE_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.DATA_ENTITY)
        );

        return jooqReactiveOperations.mono(insertQuery);
    }

    public Mono<Integer> updateNamespaceVectorForDataEntity(final long dataEntityId) {
        return updateNamespaceVectorForDataEntities(singletonList(dataEntityId));
    }

    @Override
    public Mono<Integer> updateNamespaceVectorForDataEntities(final List<Long> dataEntityIds) {
        final Field<Long> dataEntityIdField = field("data_entity_id", Long.class);

        final List<Field<?>> vectorFields = List.of(NAMESPACE.NAME);

        final var vectorSelect = DSL.select(DATA_ENTITY.ID.as(dataEntityIdField))
            .select(vectorFields)
            .from(NAMESPACE)
            .join(Tables.DATA_SOURCE).on(DATA_SOURCE.NAMESPACE_ID.eq(NAMESPACE.ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.DATA_SOURCE_ID.eq(Tables.DATA_SOURCE.ID))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .and(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()))
            .where(DATA_ENTITY.ID.in(dataEntityIds))
            .and(NAMESPACE.IS_DELETED.isFalse());

        final Insert<? extends Record> insertQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            dataEntityIdField,
            vectorFields,
            SEARCH_ENTRYPOINT.NAMESPACE_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.DATA_ENTITY),
            false
        );

        return jooqReactiveOperations.mono(insertQuery);
    }

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
            .and(DATA_ENTITY.DELETED_AT.isNull())
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
            Map.of(SEARCH_ENTRYPOINT.NAMESPACE_VECTOR,
                DSL.castNull(SEARCH_ENTRYPOINT.NAMESPACE_VECTOR));

        final UpdateConditionStep<SearchEntrypointRecord> updateQuery = DSL.with(deCte.getName())
            .as(deIdSelect)
            .update(SEARCH_ENTRYPOINT)
            .set(params)
            .from("t")
            .where(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(deCte.field(DATA_ENTITY.ID)));

        return jooqReactiveOperations.mono(updateQuery);
    }

    @Override
    public Mono<Integer> updateStructureVectorForDataEntities(final List<Long> dataEntityIds) {
        final String dsOddrnAlias = "dsv_dataset_oddrn";

        final Field<String> datasetOddrnField = DATASET_VERSION.DATASET_ODDRN.as(dsOddrnAlias);
        final Field<Long> dsvMaxField = max(DATASET_VERSION.VERSION).as("dsv_max");

        final SelectHavingStep<Record3<Long, String, Long>> subquery = DSL
            .select(DATA_ENTITY.ID, datasetOddrnField, dsvMaxField)
            .from(DATASET_VERSION)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .where(DATA_ENTITY.ID.in(dataEntityIds))
            .groupBy(DATA_ENTITY.ID, DATASET_VERSION.DATASET_ODDRN);

        final Field<Long> dataEntityIdField = subquery.field(DATA_ENTITY.ID);

        final Field<String> labelName = LABEL.NAME.as("label_name");

        final List<Field<?>> vectorFields = List.of(
            DATASET_FIELD.NAME,
            DATASET_FIELD.INTERNAL_DESCRIPTION,
            DATASET_FIELD.EXTERNAL_DESCRIPTION,
            labelName
        );

        final SelectOnConditionStep<Record> vectorSelect = DSL
            .select(vectorFields)
            .select(dataEntityIdField)
            .from(subquery)
            .join(DATASET_VERSION)
            .on(DATASET_VERSION.DATASET_ODDRN.eq(subquery.field(dsOddrnAlias, String.class)))
            .and(DATASET_VERSION.VERSION.eq(dsvMaxField))
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .join(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .leftJoin(LABEL_TO_DATASET_FIELD).on(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
            .leftJoin(LABEL).on(LABEL.ID.eq(LABEL_TO_DATASET_FIELD.LABEL_ID)).and(LABEL.IS_DELETED.isFalse());

        final Insert<? extends Record> insertQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            dataEntityIdField,
            vectorFields,
            SEARCH_ENTRYPOINT.STRUCTURE_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.DATA_ENTITY),
            true
        );

        return jooqReactiveOperations.mono(insertQuery);
    }

    @Override
    public Mono<Integer> updateChangedDataSourceVector(final long dataSourceId) {
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
    public Mono<Integer> updateTagVectorsForDataEntity(final long dataEntityId) {
        return updateStructureVectorForDataEntities(singletonList(dataEntityId));
    }

    @Override
    public Mono<Integer> updateTagVectorsForDataEntities(final List<Long> dataEntityIds) {
        final Field<Long> deId = field("data_entity_id", Long.class);

        final List<Field<?>> vectorFields = List.of(TAG.NAME);

        final SelectConditionStep<Record> vectorSelect = DSL.select(vectorFields)
            .select(DATA_ENTITY.ID.as(deId))
            .from(TAG)
            .join(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.TAG_ID.eq(TAG.ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .where(DATA_ENTITY.ID.in(dataEntityIds))
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
            .and(DATA_ENTITY.DELETED_AT.isNull())
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
            SEARCH_ENTRYPOINT.OWNER_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.DATA_ENTITY),
            true,
            Map.of(ownerNameAlias, OWNER.NAME, roleNameAlias, ROLE.NAME)
        );

        return jooqReactiveOperations.mono(ownershipQuery);
    }

    @Override
    public Mono<Integer> updateChangedLabelVector(final long labelId) {
        final SelectConditionStep<Record1<String>> deOddrnsQuery = DSL.select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .join(DATASET_VERSION).on(DATASET_VERSION.DATASET_ODDRN.eq(DATA_ENTITY.ODDRN))
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .join(LABEL_TO_DATASET_FIELD)
            .on(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .where(LABEL_TO_DATASET_FIELD.LABEL_ID.eq(labelId));

        final String dsOddrnAlias = "dsv_dataset_oddrn";

        final Field<String> datasetOddrnField = DATASET_VERSION.DATASET_ODDRN.as(dsOddrnAlias);
        final Field<Long> dsvMaxField = max(DATASET_VERSION.VERSION).as("dsv_max");

        final SelectHavingStep<Record3<Long, String, Long>> subquery = DSL
            .select(DATA_ENTITY.ID, datasetOddrnField, dsvMaxField)
            .from(DATASET_VERSION)
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .join(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .and(DATA_ENTITY.ODDRN.in(deOddrnsQuery))
            .groupBy(DATA_ENTITY.ID, datasetOddrnField);

        final Field<Long> deId = subquery.field(DATA_ENTITY.ID);

        final Field<String> labelName = LABEL.NAME.as("label_name");

        final List<Field<?>> vectorFields = List.of(
            DATASET_FIELD.NAME,
            DATASET_FIELD.INTERNAL_DESCRIPTION,
            DATASET_FIELD.EXTERNAL_DESCRIPTION,
            labelName
        );

        final SelectConditionStep<Record> vectorSelect = DSL
            .select(vectorFields)
            .select(deId)
            .from(subquery)
            .join(DATASET_VERSION)
            .on(DATASET_VERSION.DATASET_ODDRN.eq(subquery.field(dsOddrnAlias, String.class)))
            .and(DATASET_VERSION.VERSION.eq(dsvMaxField))
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .join(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .leftJoin(LABEL_TO_DATASET_FIELD).on(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
            .leftJoin(LABEL).on(LABEL.ID.eq(LABEL_TO_DATASET_FIELD.LABEL_ID))
            .where(LABEL.IS_DELETED.isFalse());

        final Insert<? extends Record> datasetFieldQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            deId,
            vectorFields,
            SEARCH_ENTRYPOINT.STRUCTURE_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.DATA_ENTITY),
            true,
            Map.of(labelName, LABEL.NAME)
        );

        return jooqReactiveOperations.mono(datasetFieldQuery);
    }

    @Override
    public Mono<Integer> updateDatasetFieldSearchVectors(final long datasetFieldId) {
        final SelectConditionStep<Record1<String>> deOddrnsQuery = DSL
            .select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .join(DATASET_VERSION).on(DATASET_VERSION.DATASET_ODDRN.eq(DATA_ENTITY.ODDRN))
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .where(DATASET_STRUCTURE.DATASET_FIELD_ID.eq(datasetFieldId));

        final String dsOddrnAlias = "dsv_dataset_oddrn";

        final Field<String> datasetOddrnField = DATASET_VERSION.DATASET_ODDRN.as(dsOddrnAlias);
        final Field<Long> dsvMaxField = max(DATASET_VERSION.VERSION).as("dsv_max");

        final SelectHavingStep<Record3<Long, String, Long>> subquery = DSL
            .select(DATA_ENTITY.ID, datasetOddrnField, dsvMaxField)
            .from(DATASET_VERSION)
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .join(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .and(DATA_ENTITY.ODDRN.in(deOddrnsQuery))
            .groupBy(DATA_ENTITY.ID, datasetOddrnField);

        final Field<Long> deId = subquery.field(DATA_ENTITY.ID);

        final Field<String> labelName = LABEL.NAME.as("label_name");

        final List<Field<?>> vectorFields = List.of(
            DATASET_FIELD.NAME,
            DATASET_FIELD.INTERNAL_DESCRIPTION,
            DATASET_FIELD.EXTERNAL_DESCRIPTION,
            labelName
        );

        final SelectOnConditionStep<Record> vectorSelect = DSL
            .select(vectorFields)
            .select(deId)
            .from(subquery)
            .join(DATASET_VERSION)
            .on(DATASET_VERSION.DATASET_ODDRN.eq(subquery.field(dsOddrnAlias, String.class)))
            .and(DATASET_VERSION.VERSION.eq(dsvMaxField))
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .join(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .leftJoin(LABEL_TO_DATASET_FIELD).on(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
            .leftJoin(LABEL).on(LABEL.ID.eq(LABEL_TO_DATASET_FIELD.LABEL_ID)).and(LABEL.IS_DELETED);

        final Insert<? extends Record> datasetFieldQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            deId,
            vectorFields,
            SEARCH_ENTRYPOINT.STRUCTURE_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.DATA_ENTITY),
            true,
            Map.of(labelName, LABEL.NAME)
        );

        return jooqReactiveOperations.mono(datasetFieldQuery);
    }

    @Override
    public Mono<Integer> updateMetadataVectors(final long dataEntityId) {
        return updateMetadataVectors(singletonList(dataEntityId));
    }

    @Override
    public Mono<Integer> updateMetadataVectors(final List<Long> dataEntityIds) {
        final Field<Long> deId = field("data_entity_id", Long.class);

        final List<Field<?>> fields = List.of(
            METADATA_FIELD.NAME,
            METADATA_FIELD_VALUE.VALUE
        );

        final SelectConditionStep<Record> select = DSL
            .select(DATA_ENTITY.ID.as(deId))
            .select(fields)
            .from(METADATA_FIELD)
            .join(METADATA_FIELD_VALUE).on(METADATA_FIELD_VALUE.METADATA_FIELD_ID.eq(METADATA_FIELD.ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(METADATA_FIELD_VALUE.DATA_ENTITY_ID))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .and(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()))
            .where(DATA_ENTITY.ID.in(dataEntityIds))
            .and(METADATA_FIELD.IS_DELETED.isFalse());

        final Insert<? extends Record> datasetFieldQuery = jooqFTSHelper.buildVectorUpsert(
            select,
            deId,
            fields,
            SEARCH_ENTRYPOINT.METADATA_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.DATA_ENTITY),
            true
        );

        return jooqReactiveOperations.mono(datasetFieldQuery);
    }
}
