package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.jooq.Field;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.DataEntityFilledField;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityFilledPojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_VERSION;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_FILLED;

@Repository
@RequiredArgsConstructor
public class ReactiveDataEntityFilledRepositoryImpl implements ReactiveDataEntityFilledRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Mono<Long> getFilledDataEntitiesCount() {
        return jooqReactiveOperations.mono(DSL.selectCount().from(DATA_ENTITY_FILLED))
            .map(r -> r.into(Long.class));
    }

    @Override
    public Mono<DataEntityFilledPojo> markEntityFilled(final Long dataEntityId,
                                                       final DataEntityFilledField dataEntityFilledField) {
        final Map<Field<?>, Object> updatedFieldsMap = new HashMap<>();
        updatedFieldsMap.put(DATA_ENTITY_FILLED.DATA_ENTITY_ID, dataEntityId);
        updatedFieldsMap.putAll(buildUpdatedFieldsMap(dataEntityFilledField, true));
        final var query = DSL.insertInto(DATA_ENTITY_FILLED)
            .set(updatedFieldsMap)
            .onDuplicateKeyUpdate()
            .set(updatedFieldsMap)
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityFilledPojo.class));
    }

    @Override
    public Mono<DataEntityFilledPojo> markEntityFilledByDatasetField(final Long datasetFieldId,
                                                                     final DataEntityFilledField filledField) {
        final Map<Field<?>, Object> updatedFieldsMap = buildUpdatedFieldsMap(filledField, true);
        final var selectQuery = DSL.selectDistinct(DATA_ENTITY.ID)
            .from(DATASET_FIELD)
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
            .join(DATASET_VERSION).on(DATASET_VERSION.ID.eq(DATASET_STRUCTURE.DATASET_VERSION_ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .where(DATASET_FIELD.ID.eq(datasetFieldId));
        final var insertQuery = DSL.insertInto(DATA_ENTITY_FILLED)
            .set(DATA_ENTITY_FILLED.DATA_ENTITY_ID, selectQuery)
            .set(updatedFieldsMap)
            .onDuplicateKeyUpdate()
            .set(updatedFieldsMap)
            .returning();
        return jooqReactiveOperations.mono(insertQuery)
            .map(r -> r.into(DataEntityFilledPojo.class));
    }

    @Override
    public Mono<DataEntityFilledPojo> markEntityUnfilled(final Long dataEntityId,
                                                         final DataEntityFilledField dataEntityFilledField) {
        final Map<Field<?>, Object> updatedFieldsMap = buildUpdatedFieldsMap(dataEntityFilledField, false);
        final var query = DSL.update(DATA_ENTITY_FILLED)
            .set(updatedFieldsMap)
            .where(DATA_ENTITY_FILLED.DATA_ENTITY_ID.eq(dataEntityId))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityFilledPojo.class));
    }

    @Override
    public Mono<DataEntityFilledPojo> markEntityUnfilledByDatasetField(final Long datasetFieldId,
                                                                       final DataEntityFilledField filledField) {
        final Map<Field<?>, Object> updatedFieldsMap = buildUpdatedFieldsMap(filledField, false);
        final var selectQuery = DSL.selectDistinct(DATA_ENTITY.ID)
            .from(DATASET_FIELD)
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
            .join(DATASET_VERSION).on(DATASET_VERSION.ID.eq(DATASET_STRUCTURE.DATASET_VERSION_ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .where(DATASET_FIELD.ID.eq(datasetFieldId));
        final var query = DSL.update(DATA_ENTITY_FILLED)
            .set(updatedFieldsMap)
            .where(DATA_ENTITY_FILLED.DATA_ENTITY_ID.eq(selectQuery))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityFilledPojo.class));
    }

    @Override
    public Mono<DataEntityFilledPojo> delete(final Long dataEntityId) {
        final var query = DSL.deleteFrom(DATA_ENTITY_FILLED)
            .where(DATA_ENTITY_FILLED.DATA_ENTITY_ID.eq(dataEntityId))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityFilledPojo.class));
    }

    private Map<Field<?>, Object> buildUpdatedFieldsMap(final DataEntityFilledField dataEntityFilledField,
                                                        final boolean isFilled) {
        return switch (dataEntityFilledField) {
            case INTERNAL_NAME -> Map.of(DATA_ENTITY_FILLED.INTERNAL_NAME_FILLED, isFilled);
            case INTERNAL_DESCRIPTION -> Map.of(DATA_ENTITY_FILLED.INTERNAL_DESCRIPTION_FILLED, isFilled);
            case INTERNAL_METADATA -> Map.of(DATA_ENTITY_FILLED.INTERNAL_METADATA_FILLED, isFilled);
            case OWNERS -> Map.of(DATA_ENTITY_FILLED.OWNERS_FILLED, isFilled);
            case CUSTOM_GROUP -> Map.of(DATA_ENTITY_FILLED.CUSTOM_GROUP_FILLED, isFilled);
            case INTERNAL_TAGS -> Map.of(DATA_ENTITY_FILLED.INTERNAL_TAGS_FILLED, isFilled);
            case TERMS -> Map.of(DATA_ENTITY_FILLED.TERMS_FILLED, isFilled);
            case DATASET_FIELD_DESCRIPTION -> Map.of(DATA_ENTITY_FILLED.DATASET_FIELD_DESCRIPTION_FILLED, isFilled);
            case DATASET_FIELD_LABELS -> Map.of(DATA_ENTITY_FILLED.DATASET_FIELD_LABELS_FILLED, isFilled);
            case DATASET_FIELD_ENUMS -> Map.of(DATA_ENTITY_FILLED.DATASET_FIELD_ENUMS_FILLED, isFilled);
            case DATASET_FIELD_TERMS -> Map.of(DATA_ENTITY_FILLED.DATASET_FIELD_TERMS_FILLED, isFilled);
            case MANUALLY_CREATED -> Map.of(DATA_ENTITY_FILLED.MANUALLY_CREATED, isFilled);
        };
    }
}
