package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.OwnershipDto;
import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import com.provectus.oddplatform.model.tables.pojos.OwnershipPojo;
import com.provectus.oddplatform.model.tables.pojos.RolePojo;
import com.provectus.oddplatform.model.tables.records.OwnershipRecord;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import static com.provectus.oddplatform.model.Tables.OWNER;
import static com.provectus.oddplatform.model.Tables.OWNERSHIP;
import static com.provectus.oddplatform.model.Tables.ROLE;

@Repository
@RequiredArgsConstructor
public class OwnershipRepositoryImpl implements OwnershipRepository {
    private final RoleRepository roleRepository;
    private final DSLContext dslContext;

    @Override
    public OwnershipDto get(final long id) {
        return dslContext
                .select(OWNERSHIP.asterisk())
                .select(ROLE.asterisk())
                .select(OWNER.asterisk())
                .from(OWNERSHIP)
                .join(OWNER).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID))
                .join(ROLE).on(OWNERSHIP.ROLE_ID.eq(ROLE.ID))
                .where(OWNERSHIP.ID.eq(id))
                .fetchOne(r -> OwnershipDto.builder()
                        .ownership(r.into(OWNERSHIP).into(OwnershipPojo.class))
                        .owner(r.into(OWNER).into(OwnerPojo.class))
                        .role(r.into(ROLE).into(RolePojo.class))
                        .build());
    }

    @Override
    public OwnershipPojo create(final OwnershipPojo pojo) {
        final OwnershipRecord record = dslContext.newRecord(OWNERSHIP, pojo);
        record.store();
        return record.into(OwnershipPojo.class);
    }

    @Override
    public void delete(final long ownershipId) {
        dslContext.deleteFrom(OWNERSHIP)
                .where(OWNERSHIP.ID.eq(ownershipId))
                .execute();
    }

    @Override
    @Transactional
    public OwnershipDto updateRole(final long ownershipId, final String roleName) {
        final long roleId = roleRepository
                .createOrGet(new RolePojo().setName(roleName))
                .getId();

        dslContext.update(OWNERSHIP)
                .set(OWNERSHIP.ROLE_ID, roleId)
                .where(OWNERSHIP.ID.eq(ownershipId))
                .execute();

        return get(ownershipId);
    }
}
