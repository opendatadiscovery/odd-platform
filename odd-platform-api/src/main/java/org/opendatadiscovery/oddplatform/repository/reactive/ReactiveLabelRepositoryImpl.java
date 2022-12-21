package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import java.util.stream.Stream;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Condition;
import org.jooq.DeleteResultStep;
import org.jooq.Field;
import org.jooq.InsertResultStep;
import org.jooq.InsertSetStep;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.LabelDto;
import org.opendatadiscovery.oddplatform.dto.LabelOrigin;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelToDatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.LabelRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.LabelToDatasetFieldRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.LABEL;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL_TO_DATASET_FIELD;

@Repository
public class ReactiveLabelRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<LabelRecord, LabelPojo>
    implements ReactiveLabelRepository {
    private static final String HAS_EXTERNAL_RELATIONS_FIELD = "has_external_relations";

    public ReactiveLabelRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                       final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, LABEL, LabelPojo.class);
    }

    @Override
    public Mono<LabelDto> getDto(final long id) {
        final var query = DSL.select(LABEL.fields())
            .select(DSL
                .coalesce(DSL.boolOr(LABEL_TO_DATASET_FIELD.ORIGIN.ne(LabelOrigin.INTERNAL.toString())), false)
                .as(HAS_EXTERNAL_RELATIONS_FIELD))
            .from(LABEL)
            .leftJoin(LABEL_TO_DATASET_FIELD).on(LABEL_TO_DATASET_FIELD.LABEL_ID.eq(LABEL.ID))
            .where(idCondition(id))
            .groupBy(LABEL.fields());

        return jooqReactiveOperations.mono(query)
            .map(this::mapLabel);
    }

    @Override
    public Mono<List<LabelDto>> listDatasetFieldDtos(final Long datasetFieldId) {
        final var query = DSL.select(LABEL.fields())
            .select(DSL
                .coalesce(DSL.boolOr(LABEL_TO_DATASET_FIELD.ORIGIN.ne(LabelOrigin.INTERNAL.toString())), false)
                .as(HAS_EXTERNAL_RELATIONS_FIELD))
            .from(LABEL)
            .leftJoin(LABEL_TO_DATASET_FIELD).on(LABEL_TO_DATASET_FIELD.LABEL_ID.eq(LABEL.ID))
            .where(addSoftDeleteFilter(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(datasetFieldId)))
            .groupBy(LABEL.fields());

        return jooqReactiveOperations.flux(query)
            .map(this::mapLabel)
            .collectList();
    }

    @Override
    public Mono<Page<LabelDto>> pageDto(final int page, final int size, final String query) {
        final Select<LabelRecord> homogeneousQuery = DSL.selectFrom(LABEL)
            .where(listCondition(query));

        final Select<? extends Record> select =
            paginate(homogeneousQuery, List.of(new OrderByField(LABEL.ID, SortOrder.ASC)), (page - 1) * size, size);

        final Table<? extends Record> labelCte = select.asTable("label_cte");

        final var cteSelect = DSL.with(labelCte.getName())
            .as(select)
            .select(labelCte.fields())
            .select(DSL
                .coalesce(DSL.boolOr(LABEL_TO_DATASET_FIELD.ORIGIN.ne(LabelOrigin.INTERNAL.toString())), false)
                .as(HAS_EXTERNAL_RELATIONS_FIELD))
            .from(labelCte.getName())
            .leftJoin(LABEL_TO_DATASET_FIELD).on(LABEL_TO_DATASET_FIELD.LABEL_ID.eq(labelCte.field(LABEL.ID)))
            .groupBy(labelCte.fields());

        return jooqReactiveOperations.flux(cteSelect)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                this::mapLabel,
                fetchCount(query)
            ));
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
    public Flux<LabelToDatasetFieldPojo> listLabelRelations(final Collection<Long> datasetFieldIds,
                                                            final LabelOrigin origin) {
        if (CollectionUtils.isEmpty(datasetFieldIds)) {
            return Flux.just();
        }

        var query = DSL.select(LABEL_TO_DATASET_FIELD.fields())
            .from(LABEL_TO_DATASET_FIELD)
            .join(LABEL).on(LABEL.ID.eq(LABEL_TO_DATASET_FIELD.LABEL_ID))
            .where(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.in(datasetFieldIds).and(LABEL.DELETED_AT.isNull()));

        if (origin != null && !origin.equals(LabelOrigin.ALL)) {
            query = query.and(LABEL_TO_DATASET_FIELD.ORIGIN.eq(origin.toString()));
        }

        return jooqReactiveOperations.flux(query).map(r -> r.into(LabelToDatasetFieldPojo.class));
    }

    @Override
    public Flux<LabelToDatasetFieldPojo> deleteRelations(final Collection<LabelToDatasetFieldPojo> pojos) {
        if (pojos.isEmpty()) {
            return Flux.just();
        }
        final Condition condition = pojos.stream()
            .map(pojo -> LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(pojo.getDatasetFieldId())
                .and(LABEL_TO_DATASET_FIELD.LABEL_ID.eq(pojo.getLabelId())))
            .reduce(Condition::or)
            .orElseThrow(() -> new RuntimeException("Couldn't build condition for label deletion"));
        final var query = DSL.delete(LABEL_TO_DATASET_FIELD)
            .where(condition)
            .returning();

        return jooqReactiveOperations.flux(query).map(r -> r.into(LabelToDatasetFieldPojo.class));
    }

    @Override
    public Flux<LabelToDatasetFieldPojo> deleteRelations(final long labelId) {
        final DeleteResultStep<LabelToDatasetFieldRecord> query = DSL
            .delete(LABEL_TO_DATASET_FIELD)
            .where(LABEL_TO_DATASET_FIELD.LABEL_ID.eq(labelId))
            .returning();

        return jooqReactiveOperations.flux(query).map(r -> r.into(LabelToDatasetFieldPojo.class));
    }

    @Override
    public Flux<LabelToDatasetFieldPojo> createRelations(final Collection<LabelToDatasetFieldPojo> pojos) {
        if (pojos.isEmpty()) {
            return Flux.just();
        }

        final List<LabelToDatasetFieldRecord> records = pojos.stream()
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

    private LabelDto mapLabel(final Record jooqRecord) {
        final Boolean hasExternalRelations = jooqRecord.get(HAS_EXTERNAL_RELATIONS_FIELD, Boolean.class);

        if (hasExternalRelations == null) {
            throw new IllegalStateException("hasExternalRelations field cannot be null");
        }

        return new LabelDto(jooqRecord.into(LabelPojo.class), hasExternalRelations);
    }
}
