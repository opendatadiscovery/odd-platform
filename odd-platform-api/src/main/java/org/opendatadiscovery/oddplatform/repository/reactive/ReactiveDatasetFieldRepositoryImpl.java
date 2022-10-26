package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.SelectConditionStep;
import org.jooq.SelectHavingStep;
import org.jooq.UpdateResultStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.dto.LabelDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.model.tables.DatasetField;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DatasetFieldRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.service.activity.ActivityLog;
import org.opendatadiscovery.oddplatform.service.activity.ActivityParameter;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_VERSION;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL_TO_DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.DatasetFieldInformationUpdated.DATASET_FIELD_ID;

@Repository
@Slf4j
public class ReactiveDatasetFieldRepositoryImpl
    extends ReactiveAbstractCRUDRepository<DatasetFieldRecord, DatasetFieldPojo>
    implements ReactiveDatasetFieldRepository {

    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveDatasetFieldRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                              final JooqQueryHelper jooqQueryHelper,
                                              final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, DATASET_FIELD, DatasetFieldPojo.class);
        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    @ActivityLog(event = ActivityEventTypeDto.DATASET_FIELD_DESCRIPTION_UPDATED)
    public Mono<DatasetFieldPojo> updateDescription(@ActivityParameter(DATASET_FIELD_ID) final long datasetFieldId,
                                                    final String description) {
        final UpdateResultStep<DatasetFieldRecord> updateQuery = DSL.update(DATASET_FIELD)
            .set(DATASET_FIELD.INTERNAL_DESCRIPTION, description)
            .where(DATASET_FIELD.ID.eq(datasetFieldId)).returning();
        return jooqReactiveOperations.mono(updateQuery).map(this::recordToPojo);
    }

    @Override
    public Mono<Map<String, DatasetFieldPojo>> getExistingFieldsByOddrnAndType(final List<DatasetFieldPojo> fields) {
        final Map<String, DatasetFieldPojo> fieldMap =
            fields.stream().collect(Collectors.toMap(DatasetFieldPojo::getOddrn, identity()));

        final Set<String> oddrns = fields.stream().map(DatasetFieldPojo::getOddrn).collect(Collectors.toSet());

        final SelectConditionStep<DatasetFieldRecord> selectConditionStep = DSL
            .selectFrom(DATASET_FIELD)
            .where(DATASET_FIELD.ODDRN.in(oddrns));

        return jooqReactiveOperations.flux(selectConditionStep)
            .map(r -> r.into(DatasetFieldPojo.class))
            .filter(fromDatabase -> {
                final DatasetFieldPojo fromIngestion = fieldMap.get(fromDatabase.getOddrn());
                if (fromIngestion == null) {
                    throw new IllegalStateException("Unexpected behaviour while mapping dataset fields");
                }

                return fromDatabase.getType().equals(fromIngestion.getType());
            })
            .collect(Collectors.toMap(DatasetFieldPojo::getOddrn, identity()));
    }

    @Override
    public Flux<DatasetFieldPojo> getExistingFieldsByOddrn(final Collection<String> oddrns) {
        final SelectConditionStep<DatasetFieldRecord> selectConditionStep = DSL
            .selectFrom(DATASET_FIELD)
            .where(DATASET_FIELD.ODDRN.in(oddrns));

        return jooqReactiveOperations.flux(selectConditionStep).map(r -> r.into(DatasetFieldPojo.class));
    }

    @Override
    public Mono<Long> getDataEntityIdByDatasetFieldId(final long datasetFieldId) {
        final var query = DSL.select(DATA_ENTITY.ID)
            .from(DATASET_FIELD)
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
            .join(DATASET_VERSION).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .join(DATA_ENTITY).on(DATASET_VERSION.DATASET_ODDRN.eq(DATA_ENTITY.ODDRN))
            .where(DATASET_FIELD.ID.eq(datasetFieldId));
        return jooqReactiveOperations.mono(query)
            .map(Record1::value1);
    }

    @Override
    public Mono<DatasetFieldDto> getDto(final long datasetFieldId) {
        final DatasetField df = DATASET_FIELD.as("df");
        final DatasetField df2 = DATASET_FIELD.as("df2");

        final List<Field<?>> selectFields = Stream.of(df.fields(), new Field<?>[] {df2.ID.as("parent_field_id")})
            .flatMap(Arrays::stream)
            .toList();

        final SelectHavingStep<Record> query = DSL.select(selectFields)
            .select(jsonArrayAgg(field(LABEL.asterisk().toString())).as("labels"))
            .from(df)
            .leftJoin(df2).on(df.PARENT_FIELD_ODDRN.eq(df2.ODDRN))
            .leftJoin(LABEL_TO_DATASET_FIELD).on(df.ID.eq(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID))
            .leftJoin(LABEL).on(LABEL_TO_DATASET_FIELD.LABEL_ID.eq(LABEL.ID)).and(LABEL.IS_DELETED.isFalse())
            .where(df.ID.eq(datasetFieldId))
            .groupBy(selectFields);

        return jooqReactiveOperations.mono(query)
            .map(this::mapRecordToDatasetFieldDto);
    }

    @NotNull
    private DatasetFieldDto mapRecordToDatasetFieldDto(final Record datasetFieldRecord) {
        final DatasetFieldPojo pojo = datasetFieldRecord.into(DatasetFieldPojo.class);
        final Long parentFieldId = datasetFieldRecord.get("parent_field_id", Long.class);

        final Set<LabelPojo> labels = jooqRecordHelper
            .extractAggRelation(datasetFieldRecord, "labels", LabelPojo.class);
        return DatasetFieldDto.builder()
            .datasetFieldPojo(pojo)
            .labels(labels.stream().map(l -> new LabelDto(l, false)).toList())
            .parentFieldId(parentFieldId)
            .build();
    }
}
