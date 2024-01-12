package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.ErdRelationshipRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.ERD_RELATIONSHIP;

@Slf4j
@Repository
public class ReactiveERDRelationshipsRepositoryImpl
    extends ReactiveAbstractCRUDRepository<ErdRelationshipRecord, ErdRelationshipPojo>
    implements ReactiveERDRelationshipsRepository {
    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveERDRelationshipsRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                                  final JooqQueryHelper jooqQueryHelper,
                                                  final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, ERD_RELATIONSHIP, ErdRelationshipPojo.class);

        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> deleteByRelationId(final Long relationshipId) {
        return jooqReactiveOperations.mono(DSL.deleteFrom(ERD_RELATIONSHIP)
                .where(ERD_RELATIONSHIP.RELATIONSHIP_ID.eq(relationshipId)))
            .then(Mono.empty());
    }

    @Override
    public Mono<List<ErdRelationshipPojo>> findERDSByRelationIds(final List<Long> relationshipId) {
        final SelectConditionStep<Record> query = DSL.select()
            .from(ERD_RELATIONSHIP)
            .where(ERD_RELATIONSHIP.RELATIONSHIP_ID.in(relationshipId));

        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(ErdRelationshipPojo.class))
            .collectList();
    }
}