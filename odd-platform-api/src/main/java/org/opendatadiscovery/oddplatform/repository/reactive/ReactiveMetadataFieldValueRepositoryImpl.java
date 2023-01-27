package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.InsertReturningStep;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataBinding;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MetadataFieldValueRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.utils.Pair;
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
    public Flux<MetadataFieldValuePojo> bulkCreateReturning(final List<MetadataFieldValuePojo> pojos) {
        if (pojos.isEmpty()) {
            return Flux.just();
        }

        return jooqReactiveOperations
            .executeInPartitionReturning(pojos, ps -> jooqReactiveOperations.flux(createInsertQuery(ps).returning()))
            .map(r -> r.into(MetadataFieldValuePojo.class));
    }

    @Override
    public Mono<Void> bulkCreate(final List<MetadataFieldValuePojo> pojos) {
        return jooqReactiveOperations.executeInPartition(pojos,
            ps -> jooqReactiveOperations.mono(createInsertQuery(ps)));
    }

    @Override
    // TODO: non updatable fields
    public Mono<Void> bulkUpdate(final List<MetadataFieldValuePojo> pojos) {
        return jooqReactiveOperations.executeInPartition(pojos, ps -> {
            final List<MetadataFieldValueRecord> records = ps.stream()
                .map(p -> jooqReactiveOperations.newRecord(METADATA_FIELD_VALUE, p))
                .toList();

            final Table<?> table = DSL.table(jooqReactiveOperations.newResult(METADATA_FIELD_VALUE, records));

            final Map<? extends Field<?>, Field<?>> fields = Arrays
                .stream(METADATA_FIELD_VALUE.fields())
                .map(r -> Pair.of(r, table.field(r.getName())))
                .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));

            final var query = DSL.update(METADATA_FIELD_VALUE)
                .set(fields)
                .from(table)
                .where(METADATA_FIELD_VALUE.DATA_ENTITY_ID.eq(table.field(METADATA_FIELD_VALUE.DATA_ENTITY_ID)))
                .and(METADATA_FIELD_VALUE.METADATA_FIELD_ID.eq(table.field(METADATA_FIELD_VALUE.METADATA_FIELD_ID)));

            return jooqReactiveOperations.mono(query);
        });
    }

    @Override
    public Flux<MetadataFieldValuePojo> listByDataEntityIds(final List<Long> dataEntityIds) {
        final var query = DSL.select(METADATA_FIELD_VALUE.fields())
            .from(METADATA_FIELD_VALUE)
            .where(METADATA_FIELD_VALUE.DATA_ENTITY_ID.in(dataEntityIds));

        return jooqReactiveOperations.flux(query).map(r -> r.into(MetadataFieldValuePojo.class));
    }

    @Override
    public Flux<MetadataFieldValuePojo> listByDataEntityIds(final List<Long> dataEntityIds,
                                                            final MetadataOrigin origin) {
        final var query = DSL.select(METADATA_FIELD_VALUE.fields())
            .from(METADATA_FIELD_VALUE)
            .join(METADATA_FIELD).on(METADATA_FIELD_VALUE.METADATA_FIELD_ID.eq(METADATA_FIELD.ID))
            .where(METADATA_FIELD_VALUE.DATA_ENTITY_ID.in(dataEntityIds).and(METADATA_FIELD.ORIGIN.eq(origin.name())));

        return jooqReactiveOperations.flux(query).map(r -> r.into(MetadataFieldValuePojo.class));
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

    @Override
    public Mono<Void> delete(final Collection<MetadataBinding> bindings) {
        if (bindings.isEmpty()) {
            return Mono.empty();
        }

        final Condition condition = bindings.stream()
            .map(binding ->
                METADATA_FIELD_VALUE.METADATA_FIELD_ID.eq(binding.metadataFieldId())
                    .and(METADATA_FIELD_VALUE.DATA_ENTITY_ID.eq(binding.entityId()))
            )
            .reduce(Condition::or)
            .orElseThrow();

        return jooqReactiveOperations.mono(DSL.deleteFrom(METADATA_FIELD_VALUE).where(condition)).then();
    }

    private InsertReturningStep<MetadataFieldValueRecord> createInsertQuery(final List<MetadataFieldValuePojo> pojos) {
        final List<MetadataFieldValueRecord> records = pojos.stream()
            .map(pojo -> jooqReactiveOperations.newRecord(METADATA_FIELD_VALUE, pojo))
            .toList();

        var insertStep = DSL.insertInto(METADATA_FIELD_VALUE);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        return insertStep.set(records.get(records.size() - 1)).onConflictDoNothing();
    }
}
