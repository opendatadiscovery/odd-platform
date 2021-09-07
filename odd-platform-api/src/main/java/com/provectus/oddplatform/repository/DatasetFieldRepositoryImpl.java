package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.model.tables.records.DatasetFieldRecord;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static com.provectus.oddplatform.model.Tables.DATASET_FIELD;

@Repository
public class DatasetFieldRepositoryImpl
    extends AbstractCRUDRepository<DatasetFieldRecord, DatasetFieldPojo>
    implements DatasetFieldRepository {

    public DatasetFieldRepositoryImpl(final DSLContext dslContext) {
        super(dslContext, DATASET_FIELD, DATASET_FIELD.ID, DATASET_FIELD.NAME, DatasetFieldPojo.class);
    }

    @Override
    public void setDescription(final long datasetFieldId, final String description) {
        dslContext.update(DATASET_FIELD)
            .set(DATASET_FIELD.INTERNAL_DESCRIPTION, description)
            .where(DATASET_FIELD.ID.eq(datasetFieldId))
            .execute();
    }
}
