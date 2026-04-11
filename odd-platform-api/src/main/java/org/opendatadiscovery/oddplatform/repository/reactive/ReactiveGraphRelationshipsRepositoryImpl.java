package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.GraphRelationshipRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.GRAPH_RELATIONSHIP;

@Slf4j
@Repository
public class ReactiveGraphRelationshipsRepositoryImpl
    extends ReactiveAbstractCRUDRepository<GraphRelationshipRecord, GraphRelationshipPojo>
    implements ReactiveGraphRelationshipsRepository {
    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveGraphRelationshipsRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                                    final JooqQueryHelper jooqQueryHelper,
                                                    final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, GRAPH_RELATIONSHIP, GraphRelationshipPojo.class);

        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> deleteByRelationId(final Long relationshipId) {
        return jooqReactiveOperations.mono(
                DSL.deleteFrom(GRAPH_RELATIONSHIP).where(GRAPH_RELATIONSHIP.RELATIONSHIP_ID.eq(relationshipId)))
            .then(Mono.empty());
    }

    @Override
    public Mono<List<GraphRelationshipPojo>> findGraphsByRelationIds(final List<Long> relationshipIds) {
        return jooqReactiveOperations.executeInPartitionReturning(relationshipIds, partitionedOddrns -> {
            final SelectConditionStep<Record> query =
                DSL.select().from(GRAPH_RELATIONSHIP).where(GRAPH_RELATIONSHIP.RELATIONSHIP_ID.in(relationshipIds));

            return jooqReactiveOperations.flux(query);
        }).map(r -> r.into(GraphRelationshipPojo.class)).collectList();
    }
}