package org.opendatadiscovery.oddplatform.repository;

import java.util.Optional;
import org.jooq.DSLContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.RoleRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.springframework.stereotype.Repository;

import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;

@Repository
public class RoleRepositoryImpl
    extends AbstractSoftDeleteCRUDRepository<RoleRecord, RolePojo>
    implements RoleRepository {

    public RoleRepositoryImpl(final DSLContext dslContext, final JooqQueryHelper jooqQueryHelper) {
        super(dslContext, jooqQueryHelper, ROLE, ROLE.ID, ROLE.IS_DELETED, ROLE.NAME, ROLE.NAME,
            ROLE.UPDATED_AT, RolePojo.class);
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
