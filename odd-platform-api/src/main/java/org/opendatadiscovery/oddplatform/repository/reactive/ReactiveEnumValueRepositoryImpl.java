package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.MapUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.EnumValueDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.EnumValueRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.dto.EnumValueDto.EnumValueDtoPayload;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.ENUM_VALUE;

@Repository
@Slf4j
public class ReactiveEnumValueRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<EnumValueRecord, EnumValuePojo>
    implements ReactiveEnumValueRepository {

    public ReactiveEnumValueRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                           final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, ENUM_VALUE, EnumValuePojo.class);
    }

    @Override
    public Flux<EnumValueDto> getEnumState(final Collection<String> datasetFieldOddrns) {
        final var query = DSL.select(DATASET_FIELD.ODDRN, DATASET_FIELD.ID)
            .select(ENUM_VALUE.fields())
            .from(DATASET_FIELD)
            .leftJoin(ENUM_VALUE).on(ENUM_VALUE.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
            .where(addSoftDeleteFilter(DATASET_FIELD.ODDRN.in(datasetFieldOddrns)));

        return jooqReactiveOperations.flux(query)
            .groupBy(r -> Tuples.of(r.get(DATASET_FIELD.ODDRN), r.get(DATASET_FIELD.ID)))
            .flatMap(flux -> flux.collectList().map(records -> {
                final List<EnumValuePojo> pojos = records.stream()
                    .filter(r -> r.get(ENUM_VALUE.ID) != null)
                    .map(r -> r.into(EnumValuePojo.class))
                    .toList();

                return new EnumValueDto(flux.key().getT1(), new EnumValueDtoPayload(flux.key().getT2(), pojos));
            }));
    }

    @Override
    public Flux<EnumValuePojo> getEnumValuesByDatasetFieldId(final long datasetFieldId) {
        final var query = DSL
            .selectFrom(ENUM_VALUE)
            .where(addSoftDeleteFilter(ENUM_VALUE.DATASET_FIELD_ID.eq(datasetFieldId)));

        return jooqReactiveOperations.flux(query).map(r -> r.into(EnumValuePojo.class));
    }

    @Override
    public Flux<EnumValuePojo> softDeleteEnumValuesExcept(final long datasetFieldId, final List<Long> idsToKeep) {
        return deleteConditionally(ENUM_VALUE.DATASET_FIELD_ID.eq(datasetFieldId).and(ENUM_VALUE.ID.notIn(idsToKeep)));
    }

    @Override
    public Mono<Void> updateExternalDescriptions(final Map<Long, String> idToDescription) {
        if (MapUtils.isEmpty(idToDescription)) {
            return Mono.empty();
        }

        final LocalDateTime updatedAt = DateTimeUtil.generateNow();

        final List<EnumValueRecord> records = idToDescription.entrySet()
            .stream()
            .map(e -> new EnumValuePojo()
                .setId(e.getKey())
                .setExternalDescription(e.getValue())
                .setUpdatedAt(updatedAt))
            .map(pojo -> jooqReactiveOperations.newRecord(ENUM_VALUE, pojo))
            .toList();

        return jooqReactiveOperations.executeInPartition(records, rs -> {
            final Table<?> table = DSL.table(jooqReactiveOperations.newResult(ENUM_VALUE, rs));

            final Map<? extends Field<?>, Field<?>> fields = Stream
                .of(ENUM_VALUE.EXTERNAL_DESCRIPTION, ENUM_VALUE.UPDATED_AT)
                .collect(Collectors.toMap(identity(), f -> Objects.requireNonNull(table.field(f.getName()))));

            final var query = DSL.update(recordTable)
                .set(fields)
                .from(table)
                .where(idField.eq(table.field(idField.getName(), Long.class)));

            return jooqReactiveOperations.mono(query);
        });
    }

    private Flux<EnumValuePojo> deleteConditionally(final Condition condition) {
        final var query = DSL.update(recordTable)
            .set(getDeleteChangedFields())
            .where(condition)
            .returning();

        return jooqReactiveOperations.flux(query).map(this::recordToPojo);
    }
}