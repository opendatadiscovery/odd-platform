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
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldMetadataValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DatasetFieldMetadataValueRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD_METADATA_VALUE;

@Repository
@RequiredArgsConstructor
public class ReactiveDatasetFieldMetadataValueRepositoryImpl implements ReactiveDatasetFieldMetadataValueRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Mono<Void> bulkCreate(final List<DatasetFieldMetadataValuePojo> pojos) {
        return jooqReactiveOperations.executeInPartition(pojos, ps -> jooqReactiveOperations.mono(insertStep(ps)));
    }

    @Override
    public Mono<Void> bulkUpdate(final List<DatasetFieldMetadataValuePojo> pojos) {
        return jooqReactiveOperations.executeInPartition(pojos, ps -> {
            final List<DatasetFieldMetadataValueRecord> records = ps.stream()
                .map(p -> jooqReactiveOperations.newRecord(DATASET_FIELD_METADATA_VALUE, p))
                .toList();

            final Table<?> table = DSL.table(jooqReactiveOperations.newResult(DATASET_FIELD_METADATA_VALUE, records));

            final Map<? extends Field<?>, Field<?>> fields = Arrays
                .stream(DATASET_FIELD_METADATA_VALUE.fields())
                .map(r -> Pair.of(r, table.field(r.getName())))
                .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));

            final var query = DSL.update(DATASET_FIELD_METADATA_VALUE)
                .set(fields)
                .from(table)
                .where(DATASET_FIELD_METADATA_VALUE.DATASET_FIELD_ID.eq(
                    table.field(DATASET_FIELD_METADATA_VALUE.DATASET_FIELD_ID)))
                .and(DATASET_FIELD_METADATA_VALUE.METADATA_FIELD_ID.eq(
                    table.field(DATASET_FIELD_METADATA_VALUE.METADATA_FIELD_ID)));

            return jooqReactiveOperations.mono(query);
        });
    }

    @Override
    public Mono<Void> delete(final Collection<MetadataBinding> bindings) {
        if (bindings.isEmpty()) {
            return Mono.empty();
        }
        final Condition condition = bindings.stream()
            .map(binding -> DATASET_FIELD_METADATA_VALUE.METADATA_FIELD_ID.eq(binding.metadataFieldId())
                .and(DATASET_FIELD_METADATA_VALUE.DATASET_FIELD_ID.eq(binding.entityId())))
            .reduce(Condition::or)
            .orElseThrow();

        return jooqReactiveOperations.mono(DSL.deleteFrom(DATASET_FIELD_METADATA_VALUE).where(condition)).then();
    }

    @Override
    public Flux<DatasetFieldMetadataValuePojo> listByDatasetFieldIds(final List<Long> fieldIds) {
        final var query = DSL.select(DATASET_FIELD_METADATA_VALUE.fields())
            .from(DATASET_FIELD_METADATA_VALUE)
            .where(DATASET_FIELD_METADATA_VALUE.DATASET_FIELD_ID.in(fieldIds));

        return jooqReactiveOperations.flux(query).map(r -> r.into(DatasetFieldMetadataValuePojo.class));
    }

    private InsertReturningStep<DatasetFieldMetadataValueRecord> insertStep(
        final List<DatasetFieldMetadataValuePojo> pojos) {
        final List<DatasetFieldMetadataValueRecord> records = pojos.stream()
            .map(pojo -> jooqReactiveOperations.newRecord(DATASET_FIELD_METADATA_VALUE, pojo))
            .toList();
        var insertStep = DSL.insertInto(DATASET_FIELD_METADATA_VALUE);
        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }
        return insertStep.set(records.get(records.size() - 1)).onConflictDoNothing();
    }
}
