package org.opendatadiscovery.oddplatform.repository.reactive;

import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LinkPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.LinkRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import static org.opendatadiscovery.oddplatform.model.Tables.LINK;

@Repository
public class LinkRepositoryImpl extends ReactiveAbstractSoftDeleteCRUDRepository<LinkRecord, LinkPojo>
    implements LinkRepository {

    public LinkRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                              final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, LINK, LinkPojo.class);
    }

    @Override
    public Flux<LinkPojo> getDataEntityLinks(final long dataEntityId) {
        final var query = DSL.selectFrom(LINK)
            .where(addSoftDeleteFilter(LINK.DATA_ENTITY_ID.eq(dataEntityId)));
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(LinkPojo.class));
    }
}
