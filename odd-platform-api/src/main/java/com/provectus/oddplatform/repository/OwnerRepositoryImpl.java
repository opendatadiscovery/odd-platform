package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import com.provectus.oddplatform.model.tables.records.OwnerRecord;
import java.util.Optional;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import static com.provectus.oddplatform.model.Tables.OWNER;

@Repository
public class OwnerRepositoryImpl
        extends AbstractSoftDeleteCRUDRepository<OwnerRecord, OwnerPojo>
        implements OwnerRepository {

    public OwnerRepositoryImpl(final DSLContext dslContext) {
        super(dslContext, OWNER, OWNER.ID, OWNER.IS_DELETED, OWNER.NAME, OWNER.NAME, OwnerPojo.class);
    }

    @Override
    public Optional<OwnerPojo> getByName(final String name) {
        return dslContext.selectFrom(OWNER)
                .where(addSoftDeleteFilter(OWNER.NAME.eq(name)))
                .fetchOptionalInto(OwnerPojo.class);
    }

    @Override
    @Transactional
    public OwnerPojo createOrGet(final OwnerPojo owner) {
        return getByName(owner.getName()).orElseGet(() -> create(owner));
    }
}
