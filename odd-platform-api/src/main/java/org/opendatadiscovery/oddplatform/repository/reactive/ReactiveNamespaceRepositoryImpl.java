package org.opendatadiscovery.oddplatform.repository.reactive;

import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.NamespaceRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;

@Repository
public class ReactiveNamespaceRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<NamespaceRecord, NamespacePojo>
    implements ReactiveNamespaceRepository {

    public ReactiveNamespaceRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                           final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, NAMESPACE, NamespacePojo.class);
    }

    @Override
    public Mono<NamespacePojo> getByName(final String name) {
        return jooqReactiveOperations
            .mono(DSL.selectFrom(NAMESPACE).where(addSoftDeleteFilter(NAMESPACE.NAME.eq(name))))
            .map(this::recordToPojo);
    }

    @Override
    public Mono<NamespacePojo> createByName(final String name) {
        return super.create(new NamespacePojo().setName(name));
    }
}