package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.InsertSetStep;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Record3;
import org.jooq.SelectConditionStep;
import org.jooq.SelectHavingStep;
import org.opendatadiscovery.oddplatform.annotation.BlockingTransactional;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelToDatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.LabelRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.LabelToDatasetFieldRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.springframework.stereotype.Repository;

import static org.jooq.impl.DSL.max;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_VERSION;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL_TO_DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;

@Repository
public class LabelRepositoryImpl
    extends AbstractSoftDeleteCRUDRepository<LabelRecord, LabelPojo>
    implements LabelRepository {

    private final JooqFTSHelper jooqFTSHelper;

    public LabelRepositoryImpl(final DSLContext dslContext,
                               final JooqQueryHelper jooqQueryHelper,
                               final JooqFTSHelper jooqFTSHelper) {
        super(dslContext, jooqQueryHelper, LABEL, LABEL.ID, LABEL.IS_DELETED, LABEL.NAME, LABEL.NAME,
            LABEL.UPDATED_AT, LabelPojo.class);
        this.jooqFTSHelper = jooqFTSHelper;
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
    @BlockingTransactional
    public void delete(final long id) {
        deleteRelations(id);
        super.delete(id);
    }

    @Override
    @BlockingTransactional
    public void delete(final List<Long> ids) {
        deleteRelations(ids);
        super.delete(ids);
    }

    @Override
    @BlockingTransactional
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
    public void deleteRelations(final long id) {
        deleteRelations(List.of(id));
    }

    @Override
    public void deleteRelations(final Collection<Long> ids) {
        if (ids.isEmpty()) {
            return;
        }

        dslContext.delete(LABEL_TO_DATASET_FIELD)
            .where(LABEL_TO_DATASET_FIELD.LABEL_ID.in(ids))
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

        final InsertSetStep<LabelToDatasetFieldRecord> insertStep = dslContext.insertInto(LABEL_TO_DATASET_FIELD);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep.set(records.get(i)).newRecord();
        }

        insertStep.set(records.get(records.size() - 1))
            .onDuplicateKeyIgnore()
            .execute();
    }

    @Override
    @BlockingTransactional
    public LabelPojo update(final LabelPojo pojo) {
        final LabelPojo updatedLabel = super.update(pojo);

        updateSearchVectors(updatedLabel.getId());

        return updatedLabel;
    }

    public void updateSearchVectors(final long labelId) {
        final SelectConditionStep<Record1<String>> deOddrnsQuery = dslContext.select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .join(DATASET_VERSION).on(DATASET_VERSION.DATASET_ODDRN.eq(DATA_ENTITY.ODDRN))
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .join(LABEL_TO_DATASET_FIELD)
            .on(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .where(LABEL_TO_DATASET_FIELD.LABEL_ID.eq(labelId));

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

        final SelectConditionStep<Record> vectorSelect = dslContext
            .select(vectorFields)
            .select(deId)
            .from(subquery)
            .join(DATASET_VERSION)
            .on(DATASET_VERSION.DATASET_ODDRN.eq(subquery.field(dsOddrnAlias, String.class)))
            .and(DATASET_VERSION.VERSION.eq(dsvMaxField))
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .join(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .leftJoin(LABEL_TO_DATASET_FIELD).on(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
            .leftJoin(LABEL).on(LABEL.ID.eq(LABEL_TO_DATASET_FIELD.LABEL_ID))
            .where(LABEL.IS_DELETED.isFalse());

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
