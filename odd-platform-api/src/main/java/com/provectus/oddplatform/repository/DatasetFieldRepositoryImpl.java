package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.model.tables.records.DatasetFieldRecord;
import com.provectus.oddplatform.model.tables.records.SearchEntrypointRecord;
import com.provectus.oddplatform.repository.util.JooqFTSHelper;
import com.provectus.oddplatform.repository.util.JooqQueryHelper;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.Nullable;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Record3;
import org.jooq.SelectConditionStep;
import org.jooq.SelectHavingStep;
import org.jooq.SelectOnConditionStep;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import static com.provectus.oddplatform.model.Tables.DATASET_FIELD;
import static com.provectus.oddplatform.model.Tables.DATASET_STRUCTURE;
import static com.provectus.oddplatform.model.Tables.DATASET_VERSION;
import static com.provectus.oddplatform.model.Tables.DATA_ENTITY;
import static com.provectus.oddplatform.model.Tables.LABEL;
import static com.provectus.oddplatform.model.Tables.LABEL_TO_DATASET_FIELD;
import static com.provectus.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static java.util.Collections.emptyList;
import static org.jooq.impl.DSL.max;

@Repository
@Slf4j
public class DatasetFieldRepositoryImpl
    extends AbstractCRUDRepository<DatasetFieldRecord, DatasetFieldPojo>
    implements DatasetFieldRepository {

    private final JooqFTSHelper jooqFTSHelper;

    public DatasetFieldRepositoryImpl(final DSLContext dslContext,
                                      final JooqQueryHelper jooqQueryHelper,
                                      final JooqFTSHelper jooqFTSHelper) {
        super(dslContext, jooqQueryHelper, DATASET_FIELD, DATASET_FIELD.ID, DATASET_FIELD.NAME, DatasetFieldPojo.class);

        this.jooqFTSHelper = jooqFTSHelper;
    }

    @Override
    @Transactional
    public void setDescription(final long datasetFieldId, final String description) {
        dslContext.update(DATASET_FIELD)
            .set(DATASET_FIELD.INTERNAL_DESCRIPTION, description)
            .where(DATASET_FIELD.ID.eq(datasetFieldId))
            .execute();

        updateSearchVectors(datasetFieldId);
    }

    @Override
    public List<DatasetFieldPojo> persist(final List<DatasetFieldPojo> fields) {
        if (fields.isEmpty()) {
            return emptyList();
        }

        final Condition condition = fields.stream()
            .map(f -> DATASET_FIELD.ODDRN.eq(f.getOddrn()).and(DATASET_FIELD.TYPE.eq(f.getType())))
            .reduce(Condition::or)
            .orElseThrow(RuntimeException::new);

        final Map<String, DatasetFieldPojo> existingFieldsDict = dslContext
            .selectFrom(DATASET_FIELD)
            .where(condition)
            .fetchStreamInto(DatasetFieldPojo.class)
            .collect(Collectors.toMap(DatasetFieldPojo::getOddrn, Function.identity()));

        final List<DatasetFieldPojo> fieldsToCreate = fields.stream()
            .filter(f -> !existingFieldsDict.containsKey(f.getOddrn()))
            .collect(Collectors.toList());

        final List<DatasetFieldPojo> createdFields = super.bulkCreate(fieldsToCreate);

        final List<DatasetFieldRecord> updatedFieldRecords = fields.stream()
            .map(f -> createRecord(f, existingFieldsDict.get(f.getOddrn())))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        dslContext.batchUpdate(updatedFieldRecords).execute();

        return Stream
            .concat(updatedFieldRecords.stream().map(r -> r.into(DatasetFieldPojo.class)), createdFields.stream())
            .collect(Collectors.toList());
    }

    @Nullable
    private DatasetFieldRecord createRecord(final DatasetFieldPojo f, final DatasetFieldPojo existingField) {
        if (null == existingField) {
            return null;
        }

        final DatasetFieldRecord fieldRecord =
            dslContext.newRecord(recordTable, f.setId(existingField.getId()));

        fieldRecord.changed(DATASET_FIELD.INTERNAL_DESCRIPTION, false);
        return fieldRecord;
    }

    @Override
    public void updateSearchVectors(final long datasetFieldId) {
        final SelectConditionStep<Record1<String>> deOddrnsQuery = dslContext.select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .join(DATASET_VERSION).on(DATASET_VERSION.DATASET_ODDRN.eq(DATA_ENTITY.ODDRN))
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .where(DATASET_STRUCTURE.DATASET_FIELD_ID.eq(datasetFieldId));

        final String dsOddrnAlias = "dsv_dataset_oddrn";

        final Field<String> datasetOddrnField = DATASET_VERSION.DATASET_ODDRN.as(dsOddrnAlias);
        final Field<Long> dsvMaxField = max(DATASET_VERSION.VERSION).as("dsv_max");

        final SelectHavingStep<Record3<Long, String, Long>> subquery = dslContext
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

        final SelectOnConditionStep<Record> vectorSelect = dslContext
            .select(vectorFields)
            .select(deId)
            .from(subquery)
            .join(DATASET_VERSION)
            .on(DATASET_VERSION.DATASET_ODDRN.eq(subquery.field(dsOddrnAlias, String.class)))
            .and(DATASET_VERSION.VERSION.eq(dsvMaxField))
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .join(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .leftJoin(LABEL_TO_DATASET_FIELD).on(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
            .leftJoin(LABEL).on(LABEL.ID.eq(LABEL_TO_DATASET_FIELD.LABEL_ID));

        jooqFTSHelper.buildSearchEntrypointUpsert(
            vectorSelect,
            deId,
            vectorFields,
            SEARCH_ENTRYPOINT.STRUCTURE_VECTOR,
            true,
            Map.of(labelName, LABEL.NAME)
        ).execute();
    }
}
