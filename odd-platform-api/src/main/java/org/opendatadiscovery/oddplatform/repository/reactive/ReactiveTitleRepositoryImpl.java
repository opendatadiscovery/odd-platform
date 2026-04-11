package org.opendatadiscovery.oddplatform.repository.reactive;

import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.TitleRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.TITLE;

@Repository
public class ReactiveTitleRepositoryImpl extends ReactiveAbstractSoftDeleteCRUDRepository<TitleRecord, TitlePojo>
    implements ReactiveTitleRepository {

    public ReactiveTitleRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                       final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, TITLE, TitlePojo.class);
    }

    @Override
    public Mono<TitlePojo> getByName(final String name) {
        return jooqReactiveOperations
            .mono(DSL.selectFrom(TITLE).where(addSoftDeleteFilter(TITLE.NAME.eq(name))))
            .map(this::recordToPojo);
    }
}
