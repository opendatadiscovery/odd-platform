package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import com.provectus.oddplatform.model.tables.records.NamespaceRecord;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static com.provectus.oddplatform.model.Tables.NAMESPACE;

@Repository
public class NamespaceRepositoryImpl
    extends AbstractSoftDeleteCRUDRepository<NamespaceRecord, NamespacePojo>
    implements NamespaceRepository {

    public NamespaceRepositoryImpl(final DSLContext dslContext) {
        super(dslContext, NAMESPACE, NAMESPACE.ID, NAMESPACE.IS_DELETED,
            NAMESPACE.NAME, NAMESPACE.NAME, NamespacePojo.class);
    }
}
