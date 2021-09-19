package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import com.provectus.oddplatform.model.tables.records.NamespaceRecord;
import com.provectus.oddplatform.repository.util.JooqQueryHelper;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static com.provectus.oddplatform.model.Tables.NAMESPACE;

@Repository
public class NamespaceRepositoryImpl
    extends AbstractSoftDeleteCRUDRepository<NamespaceRecord, NamespacePojo>
    implements NamespaceRepository {

    public NamespaceRepositoryImpl(final DSLContext dslContext, final JooqQueryHelper jooqQueryHelper) {
        super(dslContext, jooqQueryHelper, NAMESPACE, NAMESPACE.ID, NAMESPACE.IS_DELETED, NAMESPACE.NAME,
            NAMESPACE.NAME, NamespacePojo.class);
    }

    @Override
    public NamespacePojo createIfNotExists(final NamespacePojo namespacePojo) {
        return dslContext
            .selectFrom(NAMESPACE)
            .where(addSoftDeleteFilter(NAMESPACE.NAME.eq(namespacePojo.getName())))
            .fetchOptionalInto(NamespacePojo.class)
            .orElseGet(() -> super.create(namespacePojo));
    }
}
