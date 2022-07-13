package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.jooq.Condition;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.UpdateResultStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.model.tables.DatasetField;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DatasetFieldRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;

@Repository
@Slf4j
public class ReactiveDatasetFieldRepositoryImpl
    extends ReactiveAbstractCRUDRepository<DatasetFieldRecord, DatasetFieldPojo>
    implements ReactiveDatasetFieldRepository {

    public ReactiveDatasetFieldRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                              final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, DATASET_FIELD, DatasetFieldPojo.class);
    }

    @Override
    public Mono<DatasetFieldPojo> updateDescription(final long datasetFieldId, final String description) {
        final UpdateResultStep<DatasetFieldRecord> updateQuery = DSL.update(DATASET_FIELD)
            .set(DATASET_FIELD.INTERNAL_DESCRIPTION, description)
            .where(DATASET_FIELD.ID.eq(datasetFieldId)).returning();
        return jooqReactiveOperations.mono(updateQuery).map(this::recordToPojo);
    }

    @Override
    public Mono<Map<String, DatasetFieldPojo>> getExistingFieldsByOddrnAndType(final List<DatasetFieldPojo> fields) {
        final Condition condition = fields.stream()
            .map(f -> DATASET_FIELD.ODDRN.eq(f.getOddrn()).and(DATASET_FIELD.TYPE.eq(f.getType())))
            .reduce(Condition::or)
            .orElseThrow(RuntimeException::new);

        final SelectConditionStep<DatasetFieldRecord> selectConditionStep = DSL
            .selectFrom(DATASET_FIELD)
            .where(condition);

        return jooqReactiveOperations.flux(selectConditionStep)
            .map(r -> r.into(DatasetFieldPojo.class))
            .collect(Collectors.toMap(DatasetFieldPojo::getOddrn, Function.identity()));
    }

    @Override
    public Mono<List<DatasetFieldPojo>> getDatasetFieldsByOddrns(final Collection<String> oddrns) {
        final var query = DSL
            .selectFrom(DATASET_FIELD)
            .where(DATASET_FIELD.ODDRN.in(oddrns));

        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(DatasetFieldPojo.class))
            .collectList();
    }

    @Override
    public Mono<DatasetFieldDto> getDto(final long datasetFieldId) {
        final DatasetField df = DATASET_FIELD.as("df");
        final DatasetField df2 = DATASET_FIELD.as("df2");

        final SelectConditionStep<Record> selectConditionStep = DSL.select(df.asterisk(), df2.ID.as("parent_field_id"))
            .from(df)
            .leftJoin(df2)
            .on(df.PARENT_FIELD_ODDRN.eq(df2.ODDRN))
            .where(df.ID.eq(datasetFieldId));

        return jooqReactiveOperations.mono(selectConditionStep)
            .map(this::mapRecordToDatasetFieldDto);
    }

    @NotNull
    private DatasetFieldDto mapRecordToDatasetFieldDto(final Record datasetFieldRecord) {
        final DatasetFieldPojo pojo = datasetFieldRecord.into(DatasetFieldPojo.class);
        final Long parentFieldId = datasetFieldRecord.get("parent_field_id", Long.class);

        return DatasetFieldDto.builder()
            .datasetFieldPojo(pojo)
            .parentFieldId(parentFieldId)
            .build();
    }
}
