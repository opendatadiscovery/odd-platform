package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.model.tables.records.DatasetFieldRecord;
import com.provectus.oddplatform.repository.util.JooqQueryHelper;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.jetbrains.annotations.Nullable;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static com.provectus.oddplatform.model.Tables.DATASET_FIELD;
import static java.util.Collections.emptyList;

@Repository
public class DatasetFieldRepositoryImpl
    extends AbstractCRUDRepository<DatasetFieldRecord, DatasetFieldPojo>
    implements DatasetFieldRepository {

    public DatasetFieldRepositoryImpl(final DSLContext dslContext, final JooqQueryHelper jooqQueryHelper) {
        super(dslContext, jooqQueryHelper, DATASET_FIELD, DATASET_FIELD.ID, DATASET_FIELD.NAME, DatasetFieldPojo.class);
    }

    @Override
    public void setDescription(final long datasetFieldId, final String description) {
        dslContext.update(DATASET_FIELD)
            .set(DATASET_FIELD.INTERNAL_DESCRIPTION, description)
            .where(DATASET_FIELD.ID.eq(datasetFieldId))
            .execute();
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
}
