package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import org.jooq.DeleteResultStep;
import org.jooq.InsertResultStep;
import org.jooq.InsertSetStep;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelToDatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.LabelRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.LabelToDatasetFieldRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import static java.util.Collections.singletonList;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL_TO_DATASET_FIELD;

@Repository
public class ReactiveLabelRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<LabelRecord, LabelPojo>
    implements ReactiveLabelRepository {

    public ReactiveLabelRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                       final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, LABEL, LabelPojo.class);
    }

    @Override
    public Flux<LabelPojo> listByDatasetFieldId(final long datasetFieldId) {
        final SelectConditionStep<Record> query = DSL
            .select(LABEL.asterisk())
            .from(LABEL)
            .join(LABEL_TO_DATASET_FIELD).on(LABEL.ID.eq(LABEL_TO_DATASET_FIELD.LABEL_ID))
            .where(addSoftDeleteFilter(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(datasetFieldId)));

        return jooqReactiveOperations.flux(query).map(r -> r.into(LabelPojo.class));
    }

    @Override
    public Flux<LabelPojo> listByNames(final Collection<String> names) {
        final SelectConditionStep<Record> query = DSL
            .select(LABEL.asterisk())
            .from(LABEL)
            .where(addSoftDeleteFilter(LABEL.NAME.in(names)));

        return jooqReactiveOperations.flux(query).map(r -> r.into(LabelPojo.class));
    }

    @Override
    public Flux<LabelToDatasetFieldPojo> deleteRelations(final long datasetFieldId,
                                                         final Collection<Long> labelIds) {
        if (labelIds.isEmpty()) {
            return Flux.just();
        }

        final DeleteResultStep<LabelToDatasetFieldRecord> query = DSL
            .delete(LABEL_TO_DATASET_FIELD)
            .where(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(datasetFieldId)
                .and(LABEL_TO_DATASET_FIELD.LABEL_ID.in(labelIds)))
            .returning();

        return jooqReactiveOperations.flux(query).map(r -> r.into(LabelToDatasetFieldPojo.class));
    }

    @Override
    public Flux<LabelToDatasetFieldPojo> deleteRelations(final long labelId) {
        return deleteRelations(singletonList(labelId));
    }

    @Override
    public Flux<LabelToDatasetFieldPojo> deleteRelations(final Collection<Long> labelIds) {
        if (labelIds.isEmpty()) {
            return Flux.just();
        }

        final DeleteResultStep<LabelToDatasetFieldRecord> query = DSL
            .delete(LABEL_TO_DATASET_FIELD)
            .where(LABEL_TO_DATASET_FIELD.LABEL_ID.in(labelIds))
            .returning();

        return jooqReactiveOperations.flux(query).map(r -> r.into(LabelToDatasetFieldPojo.class));
    }

    @Override
    public Flux<LabelToDatasetFieldPojo> createRelations(final long datasetFieldId,
                                                         final Collection<Long> labelIds) {
        if (labelIds.isEmpty()) {
            return Flux.just();
        }

        final List<LabelToDatasetFieldRecord> records = labelIds.stream()
            .map(t -> new LabelToDatasetFieldPojo().setDatasetFieldId(datasetFieldId).setLabelId(t))
            .map(p -> jooqReactiveOperations.newRecord(LABEL_TO_DATASET_FIELD, p))
            .toList();

        final InsertSetStep<LabelToDatasetFieldRecord> insertStep = DSL.insertInto(LABEL_TO_DATASET_FIELD);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep.set(records.get(i)).newRecord();
        }

        final InsertResultStep<LabelToDatasetFieldRecord> query = insertStep
            .set(records.get(records.size() - 1))
            .onDuplicateKeyIgnore()
            .returning();

        return jooqReactiveOperations.flux(query).map(r -> r.into(LabelToDatasetFieldPojo.class));
    }
}
