package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.RelationshipRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import static org.opendatadiscovery.oddplatform.model.Tables.RELATIONSHIP;

@Slf4j
@Repository
public class ReactiveRelationshipsRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<RelationshipRecord, RelationshipPojo>
    implements ReactiveRelationshipsRepository {
    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveRelationshipsRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                               final JooqQueryHelper jooqQueryHelper,
                                               final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, RELATIONSHIP, RelationshipPojo.class);

        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Flux<RelationshipPojo> getRelationshipByDatasetOddrns(final Set<String> oddrns) {
        return jooqReactiveOperations.flux(DSL.select(RELATIONSHIP)
            .from(RELATIONSHIP)
            .where(RELATIONSHIP.SOURCE_DATASET_ODDRN.in(oddrns).or(RELATIONSHIP.TARGET_DATASET_ODDRN.in(oddrns))))
            .map(r -> r.into(RelationshipPojo.class));
    }
}
