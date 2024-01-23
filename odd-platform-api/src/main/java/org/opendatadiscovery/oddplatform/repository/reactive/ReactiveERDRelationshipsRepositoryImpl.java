package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipDetailsPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.ErdRelationshipDetailsRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.ERD_RELATIONSHIP_DETAILS;

@Slf4j
@Repository
public class ReactiveERDRelationshipsRepositoryImpl
    extends ReactiveAbstractCRUDRepository<ErdRelationshipDetailsRecord, ErdRelationshipDetailsPojo>
    implements ReactiveERDRelationshipsRepository {
    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveERDRelationshipsRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                                  final JooqQueryHelper jooqQueryHelper,
                                                  final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, ERD_RELATIONSHIP_DETAILS, ErdRelationshipDetailsPojo.class);

        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Mono<List<ErdRelationshipDetailsPojo>> findERDSByRelationIds(final List<Long> relationshipId) {
        return jooqReactiveOperations.executeInPartitionReturning(relationshipId, partitionedOddrns -> {
            final SelectConditionStep<Record> query = DSL.select().from(ERD_RELATIONSHIP_DETAILS)
                .where(ERD_RELATIONSHIP_DETAILS.RELATIONSHIP_ID.in(partitionedOddrns));

            return jooqReactiveOperations.flux(query);
        }).map(r -> r.into(ErdRelationshipDetailsPojo.class)).collectList();
    }
}