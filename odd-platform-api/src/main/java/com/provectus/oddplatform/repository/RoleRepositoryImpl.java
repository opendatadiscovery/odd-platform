package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.RolePojo;
import com.provectus.oddplatform.model.tables.records.RoleRecord;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import static com.provectus.oddplatform.model.Tables.ROLE;

@Repository
public class RoleRepositoryImpl
    extends AbstractSoftDeleteCRUDRepository<RoleRecord, RolePojo>
    implements RoleRepository {

    public RoleRepositoryImpl(final DSLContext dslContext) {
        super(dslContext, ROLE, ROLE.ID, ROLE.IS_DELETED,
            ROLE.NAME, ROLE.NAME, RolePojo.class);
    }

    @Override
    public Optional<RolePojo> getByName(final String name) {
        return dslContext.selectFrom(ROLE)
            .where(addSoftDeleteFilter(ROLE.NAME.eq(name)))
            .fetchOptionalInto(RolePojo.class);
    }

    @Override
    public RolePojo createOrGet(final RolePojo role) {
        return getByName(role.getName()).orElseGet(() -> create(role));
    }
}
