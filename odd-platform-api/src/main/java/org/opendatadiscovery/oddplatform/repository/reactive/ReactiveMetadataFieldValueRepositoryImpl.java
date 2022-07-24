package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MetadataFieldValueRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD_VALUE;

@Repository
@RequiredArgsConstructor
public class ReactiveMetadataFieldValueRepositoryImpl implements ReactiveMetadataFieldValueRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Flux<MetadataFieldValuePojo> bulkCreate(final Collection<MetadataFieldValuePojo> pojos) {
        if (pojos.isEmpty()) {
            return Flux.just();
        }
        final List<MetadataFieldValueRecord> records = pojos.stream()
            .map(pojo -> jooqReactiveOperations.newRecord(METADATA_FIELD_VALUE, pojo))
            .toList();

        var insertStep = DSL.insertInto(METADATA_FIELD_VALUE);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        return jooqReactiveOperations.flux(insertStep.set(records.get(records.size() - 1))
                .onConflictDoNothing().returning())
            .map(r -> r.into(MetadataFieldValuePojo.class));
    }

    @Override
    public Mono<List<MetadataFieldValuePojo>> listByDataEntityIds(final List<Long> dataEntityIds,
                                                                  final MetadataOrigin origin) {
        final var query = DSL.select(METADATA_FIELD_VALUE.fields())
            .from(METADATA_FIELD_VALUE)
            .join(METADATA_FIELD).on(METADATA_FIELD_VALUE.METADATA_FIELD_ID.eq(METADATA_FIELD.ID))
            .where(METADATA_FIELD_VALUE.DATA_ENTITY_ID.in(dataEntityIds).and(METADATA_FIELD.ORIGIN.eq(origin.name())));
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(MetadataFieldValuePojo.class))
            .collectList();
    }

    @Override
    public Mono<MetadataFieldValuePojo> update(final MetadataFieldValuePojo pojo) {
        final var query = DSL.update(METADATA_FIELD_VALUE)
            .set(METADATA_FIELD_VALUE.VALUE, pojo.getValue())
            .set(METADATA_FIELD_VALUE.ACTIVE, pojo.getActive())
            .where(METADATA_FIELD_VALUE.METADATA_FIELD_ID.eq(pojo.getMetadataFieldId())
                .and(METADATA_FIELD_VALUE.DATA_ENTITY_ID.eq(pojo.getDataEntityId())))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(MetadataFieldValuePojo.class));
    }

    @Override
    public Mono<MetadataFieldValuePojo> delete(final long dataEntityId, final long metadataFieldId) {
        final var query = DSL.deleteFrom(METADATA_FIELD_VALUE)
            .where(METADATA_FIELD_VALUE.DATA_ENTITY_ID.eq(dataEntityId))
            .and(METADATA_FIELD_VALUE.METADATA_FIELD_ID.eq(metadataFieldId))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(MetadataFieldValuePojo.class));
    }
}
