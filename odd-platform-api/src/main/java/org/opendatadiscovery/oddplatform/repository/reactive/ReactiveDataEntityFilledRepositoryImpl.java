package org.opendatadiscovery.oddplatform.repository.reactive;

import lombok.RequiredArgsConstructor;
import org.jooq.impl.DSL;
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
    public Mono<DataEntityFilledPojo> markEntityFilled(final Long dataEntityId) {
        final var query = DSL.insertInto(DATA_ENTITY_FILLED)
            .set(DATA_ENTITY_FILLED.DATA_ENTITY_ID, dataEntityId)
            .onDuplicateKeyIgnore()
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityFilledPojo.class));
    }

    @Override
    public Mono<DataEntityFilledPojo> markEntityFilledByDatasetField(final Long datasetFieldId) {
        final var query = DSL.select(DATA_ENTITY.ID)
            .from(DATASET_FIELD)
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
            .join(DATASET_VERSION).on(DATASET_VERSION.ID.eq(DATASET_STRUCTURE.DATASET_VERSION_ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .where(DATASET_FIELD.ID.eq(datasetFieldId));
        final var insertQuery = DSL.insertInto(DATA_ENTITY_FILLED)
            .select(query)
            .onDuplicateKeyIgnore()
            .returning();
        return jooqReactiveOperations.mono(insertQuery)
            .map(r -> r.into(DataEntityFilledPojo.class));
    }

    @Override
    public Mono<DataEntityFilledPojo> markEntityUnfilled(final Long dataEntityId) {
        final var query = DSL.deleteFrom(DATA_ENTITY_FILLED)
            .where(DATA_ENTITY_FILLED.DATA_ENTITY_ID.eq(dataEntityId))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityFilledPojo.class));
    }
}
