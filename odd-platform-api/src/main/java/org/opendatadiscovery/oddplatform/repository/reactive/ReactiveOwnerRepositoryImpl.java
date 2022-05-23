package org.opendatadiscovery.oddplatform.repository.reactive;

import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.OwnerRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;

@Repository
public class ReactiveOwnerRepositoryImpl extends ReactiveAbstractSoftDeleteCRUDRepository<OwnerRecord, OwnerPojo>
    implements ReactiveOwnerRepository {

    public ReactiveOwnerRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                       final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, OWNER, OwnerPojo.class);
    }

    @Override
    public Mono<OwnerPojo> getByName(final String name) {
        return jooqReactiveOperations
            .mono(DSL.selectFrom(OWNER).where(addSoftDeleteFilter(OWNER.NAME.eq(name))))
            .map(this::recordToPojo);
    }
}
