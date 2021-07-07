package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.TypeEntityRelationPojo;
import com.provectus.oddplatform.model.tables.records.TypeEntityRelationRecord;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static com.provectus.oddplatform.model.Tables.TYPE_ENTITY_RELATION;

@Repository
public class TypeEntityRelationRepositoryImpl
    extends AbstractCRUDRepository<TypeEntityRelationRecord, TypeEntityRelationPojo>
    implements TypeEntityRelationRepository {

    public TypeEntityRelationRepositoryImpl(final DSLContext dslContext) {
        super(dslContext, TYPE_ENTITY_RELATION, null, null, TypeEntityRelationPojo.class);
    }
}
