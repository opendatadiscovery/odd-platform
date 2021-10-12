package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.OwnershipDto;
import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import com.provectus.oddplatform.model.tables.pojos.OwnershipPojo;
import com.provectus.oddplatform.model.tables.pojos.RolePojo;
import com.provectus.oddplatform.model.tables.records.OwnershipRecord;
import com.provectus.oddplatform.repository.util.JooqFTSHelper;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import static com.provectus.oddplatform.model.Tables.DATA_ENTITY;
import static com.provectus.oddplatform.model.Tables.OWNER;
import static com.provectus.oddplatform.model.Tables.OWNERSHIP;
import static com.provectus.oddplatform.model.Tables.ROLE;
import static com.provectus.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static org.jooq.impl.DSL.field;

@Repository
@RequiredArgsConstructor
public class OwnershipRepositoryImpl implements OwnershipRepository {
    private final RoleRepository roleRepository;
    private final DSLContext dslContext;
    private final JooqFTSHelper jooqFTSHelper;

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
    @Transactional
    public OwnershipPojo create(final OwnershipPojo pojo) {
        final OwnershipRecord record = dslContext.newRecord(OWNERSHIP, pojo);
        record.store();

        final OwnershipPojo createdOwnership = record.into(OwnershipPojo.class);

        updateSearchVectors(createdOwnership.getId());

        return createdOwnership;
    }

    @Override
    public void delete(final long ownershipId) {
        dslContext.deleteFrom(OWNERSHIP)
            .where(OWNERSHIP.ID.eq(ownershipId))
            .execute();
    }

    @Override
    @Transactional
    // TODO: fix ordering: first get and check for existence
    public OwnershipDto updateRole(final long ownershipId, final String roleName) {
        final long roleId = roleRepository
            .createOrGet(new RolePojo().setName(roleName))
            .getId();

        dslContext.update(OWNERSHIP)
            .set(OWNERSHIP.ROLE_ID, roleId)
            .where(OWNERSHIP.ID.eq(ownershipId))
            .execute();

        updateSearchVectors(ownershipId);

        return get(ownershipId);
    }

    private void updateSearchVectors(final long ownershipId) {
        final Field<Long> dataEntityId = field("data_entity_id", Long.class);

        final Field<String> ownerNameAlias = field("owner_name", String.class);
        final Field<String> roleNameAlias = field("role_name", String.class);

        final List<Field<?>> vectorFields = List.of(
            OWNER.NAME.as(ownerNameAlias),
            ROLE.NAME.as(roleNameAlias)
        );

        final SelectConditionStep<Record> vectorSelect = dslContext.select(vectorFields)
            .select(DATA_ENTITY.ID.as(dataEntityId))
            .from(OWNER)
            .join(OWNERSHIP).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .join(ROLE).on(ROLE.ID.eq(OWNERSHIP.ROLE_ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(OWNERSHIP.DATA_ENTITY_ID))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .where(OWNERSHIP.ID.eq(ownershipId));

        jooqFTSHelper.buildSearchEntrypointUpsert(
            vectorSelect,
            dataEntityId,
            vectorFields,
            SEARCH_ENTRYPOINT.OWNER_VECTOR,
            true,
            Map.of(ownerNameAlias, OWNER.NAME, roleNameAlias, ROLE.NAME)
        ).execute();
    }
}
