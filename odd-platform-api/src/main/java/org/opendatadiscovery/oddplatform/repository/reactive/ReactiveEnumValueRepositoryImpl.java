package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import java.util.Map;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.UpdateResultStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.EnumValueRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import static org.opendatadiscovery.oddplatform.model.Tables.ENUM_VALUE;

@Repository
public class ReactiveEnumValueRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<EnumValueRecord, EnumValuePojo>
    implements ReactiveEnumValueRepository {
    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveEnumValueRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                           final JooqRecordHelper jooqRecordHelper,
                                           final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, ENUM_VALUE, EnumValuePojo.class);
        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Flux<EnumValuePojo> getEnumValuesByDatasetFieldId(final long datasetFieldId) {
        final var conditionWithSoftDeleteFilter = addSoftDeleteFilter(
            ENUM_VALUE.DATASET_FIELD_ID.eq(datasetFieldId));

        final var query = DSL.selectFrom(ENUM_VALUE)
            .where(conditionWithSoftDeleteFilter);

        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(EnumValuePojo.class));
    }

    @Override
    public Flux<EnumValuePojo> softDeleteOutdatedEnumValuesExcept(final long datasetFieldId,
                                                                  final List<Long> idsToKeep) {
        return deleteConditionally(
            ENUM_VALUE.DATASET_FIELD_ID.eq(datasetFieldId)
            .and(ENUM_VALUE.ID.notIn(idsToKeep))
        );
    }

    private Flux<EnumValuePojo> deleteConditionally(final Condition condition) {
        final var updatedFieldsMap = getDeleteChangedFields();
        final var query = DSL.update(recordTable)
            .set(updatedFieldsMap)
            .where(condition)
            .returning();

        return jooqReactiveOperations.flux(query).map(this::recordToPojo);
    }
}