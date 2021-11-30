package org.opendatadiscovery.oddplatform.repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import org.jooq.DSLContext;
import org.jooq.InsertValuesStep2;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TypeEntityRelationPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.TypeEntityRelationRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.springframework.stereotype.Repository;

import static org.opendatadiscovery.oddplatform.model.Tables.TYPE_ENTITY_RELATION;

@Repository
public class TypeEntityRelationRepositoryImpl
    extends AbstractCRUDRepository<TypeEntityRelationRecord, TypeEntityRelationPojo>
    implements TypeEntityRelationRepository {

    public TypeEntityRelationRepositoryImpl(final DSLContext dslContext, final JooqQueryHelper jooqQueryHelper) {
        super(dslContext, jooqQueryHelper, TYPE_ENTITY_RELATION, null, null, TypeEntityRelationPojo.class);
    }

    @Override
    public List<TypeEntityRelationPojo> bulkCreate(final Collection<TypeEntityRelationPojo> pojos) {
        InsertValuesStep2<TypeEntityRelationRecord, Long, Long> step = dslContext.insertInto(
            TYPE_ENTITY_RELATION,
            TYPE_ENTITY_RELATION.DATA_ENTITY_ID,
            TYPE_ENTITY_RELATION.DATA_ENTITY_TYPE_ID
        );

        for (final TypeEntityRelationPojo p : pojos) {
            step = step.values(p.getDataEntityId(), p.getDataEntityTypeId());
        }

        step.onDuplicateKeyIgnore().execute();

        return new ArrayList<>(pojos);
    }
}
