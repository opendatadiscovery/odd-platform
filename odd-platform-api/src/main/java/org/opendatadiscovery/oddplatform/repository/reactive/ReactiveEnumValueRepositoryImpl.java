package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
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
    public Flux<EnumValuePojo> getEnumValuesByFieldId(final Long datasetFieldId) {
        final var query = DSL.select()
            .from(ENUM_VALUE)
            .where(ENUM_VALUE.DATASET_FIELD_ID.eq(datasetFieldId).and(ENUM_VALUE.IS_DELETED.isFalse()));

        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(EnumValuePojo.class));
    }

    public Flux<EnumValuePojo> softDeleteOutdatedEnumValues(final Long datasetFieldId,
                                                                  final List<Long> idsToKeep) {
        return deleteConditionally(ENUM_VALUE.DATASET_FIELD_ID.eq(datasetFieldId).and(ENUM_VALUE.ID.notIn(idsToKeep)));
    }
}
