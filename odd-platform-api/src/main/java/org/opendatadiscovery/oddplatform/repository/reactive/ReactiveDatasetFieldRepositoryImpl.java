package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.jooq.Condition;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.UpdateResultStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.model.tables.DatasetField;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DatasetFieldRecord;
import org.opendatadiscovery.oddplatform.repository.LabelRepository;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;

@Repository
@Slf4j
public class ReactiveDatasetFieldRepositoryImpl
    extends ReactiveAbstractCRUDRepository<DatasetFieldRecord, DatasetFieldPojo>
    implements ReactiveDatasetFieldRepository {

    private final JooqRecordHelper jooqRecordHelper;
    private final JooqFTSHelper jooqFTSHelper;
    private final LabelRepository labelRepository;

    public ReactiveDatasetFieldRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                              final JooqQueryHelper jooqQueryHelper,
                                              final JooqRecordHelper jooqRecordHelper,
                                              final JooqFTSHelper jooqFTSHelper,
                                              final LabelRepository labelRepository) {
        super(jooqReactiveOperations, jooqQueryHelper, DATASET_FIELD, DatasetFieldPojo.class);
        this.jooqRecordHelper = jooqRecordHelper;
        this.jooqFTSHelper = jooqFTSHelper;
        this.labelRepository = labelRepository;
    }

    @Override
    @ReactiveTransactional
    public Mono<DatasetFieldPojo> updateDescription(final long datasetFieldId, final String description) {
        final UpdateResultStep<DatasetFieldRecord> updateQuery = DSL.update(DATASET_FIELD)
            .set(DATASET_FIELD.INTERNAL_DESCRIPTION, description)
            .where(DATASET_FIELD.ID.eq(datasetFieldId)).returning();
        return jooqReactiveOperations.mono(updateQuery).map(this::recordToPojo);
    }

    @Override
    public Flux<DatasetFieldPojo> persist(final List<DatasetFieldPojo> fields) {
        if (fields.isEmpty()) {
            return Flux.empty();
        }

        final Mono<Map<String, DatasetFieldPojo>> existingFieldsDict = getExistingFieldsDict(fields);

        return existingFieldsDict.flatMapMany(ed -> {
                final List<DatasetFieldPojo> fieldsToCreate = fields.stream()
                    .filter(f -> !ed.containsKey(f.getOddrn()))
                    .collect(Collectors.toList());

                final List<DatasetFieldPojo> updatedFieldRecords = fields.stream()
                    .map(f -> createRecord(f, ed.get(f.getOddrn())))
                    .filter(Objects::nonNull)
                    .map(r -> r.into(DatasetFieldPojo.class))
                    .collect(Collectors.toList());

                return Flux.concat(bulkCreate(fieldsToCreate), bulkUpdate(updatedFieldRecords));
            }
        );
    }

    @NotNull
    private Mono<Map<String, DatasetFieldPojo>> getExistingFieldsDict(final List<DatasetFieldPojo> fields) {
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

    @Nullable
    private DatasetFieldRecord createRecord(final DatasetFieldPojo f, final DatasetFieldPojo existingField) {
        if (null == existingField) {
            return null;
        }

        final DatasetFieldRecord fieldRecord =
            jooqReactiveOperations.newRecord(recordTable, f.setId(existingField.getId()));

        fieldRecord.changed(DATASET_FIELD.INTERNAL_DESCRIPTION, false);
        return fieldRecord;
    }

    @Override
    public Mono<DatasetFieldDto> getDto(final long id) {
        final DatasetField df = DATASET_FIELD.as("df");
        final DatasetField df2 = DATASET_FIELD.as("df2");

        final SelectConditionStep<Record> selectConditionStep = DSL.select(df.asterisk(), df2.ID.as("parent_field_id"))
            .from(df)
            .leftJoin(df2)
            .on(df.PARENT_FIELD_ODDRN.eq(df2.ODDRN))
            .where(df.ID.eq(id));

        return jooqReactiveOperations.mono(selectConditionStep)
            .map(this::mapRecordToDatasetFieldDto)
            .switchIfEmpty(
                Mono.error(new IllegalArgumentException(String.format("DatasetField not found by id = %s", id))));
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
