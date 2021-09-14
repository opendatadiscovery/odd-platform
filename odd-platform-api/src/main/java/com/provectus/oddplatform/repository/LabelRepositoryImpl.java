package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.LabelPojo;
import com.provectus.oddplatform.model.tables.pojos.LabelToDatasetFieldPojo;
import com.provectus.oddplatform.model.tables.records.LabelRecord;
import com.provectus.oddplatform.model.tables.records.LabelToDatasetFieldRecord;
import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static com.provectus.oddplatform.model.Tables.LABEL;
import static com.provectus.oddplatform.model.Tables.LABEL_TO_DATASET_FIELD;

@Repository
public class LabelRepositoryImpl
    extends AbstractSoftDeleteCRUDRepository<LabelRecord, LabelPojo>
    implements LabelRepository {
    public LabelRepositoryImpl(final DSLContext dslContext) {
        super(dslContext, LABEL, LABEL.ID, LABEL.IS_DELETED, LABEL.NAME, LABEL.NAME, LabelPojo.class);
    }

    @Override
    public List<LabelPojo> listByDatasetFieldId(final long datasetFieldId) {
        final List<Condition> whereClause =
            addSoftDeleteFilter(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(datasetFieldId));

        return dslContext.select(LABEL.asterisk())
            .from(LABEL)
            .join(LABEL_TO_DATASET_FIELD).on(LABEL.ID.eq(LABEL_TO_DATASET_FIELD.LABEL_ID))
            .where(whereClause)
            .fetchStreamInto(LabelPojo.class)
            .collect(Collectors.toList());
    }

    @Override
    public List<LabelPojo> listByNames(final Collection<String> names) {
        return dslContext.select(LABEL.asterisk())
            .from(LABEL)
            .where(addSoftDeleteFilter(LABEL.NAME.in(names)))
            .fetchStreamInto(LabelPojo.class)
            .collect(Collectors.toList());
    }

    @Override
    public void deleteRelations(final long datasetFieldId, final Collection<Long> labels) {
        if (labels.isEmpty()) {
            return;
        }

        dslContext.delete(LABEL_TO_DATASET_FIELD)
            .where(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(datasetFieldId)
                .and(LABEL_TO_DATASET_FIELD.LABEL_ID.in(labels)))
            .execute();
    }

    @Override
    public void createRelations(final long datasetFieldId, final Collection<Long> labels) {
        if (labels.isEmpty()) {
            return;
        }

        final List<LabelToDatasetFieldRecord> records = labels.stream()
            .map(t -> new LabelToDatasetFieldPojo().setDatasetFieldId(datasetFieldId).setLabelId(t))
            .map(p -> dslContext.newRecord(LABEL_TO_DATASET_FIELD, p))
            .collect(Collectors.toList());

        try {
            // TODO: bad idea, will not throw error
            dslContext.loadInto(LABEL_TO_DATASET_FIELD)
                .onDuplicateKeyIgnore()
                .loadRecords(records)
                .fields(LABEL_TO_DATASET_FIELD.fields())
                .execute();
        } catch (final IOException e) {
            throw new RuntimeException(e);
        }
    }
}
