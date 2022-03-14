package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.exception.DataAccessException;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.OwnershipRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.springframework.stereotype.Repository;

import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;

@Repository
@RequiredArgsConstructor
public class OwnershipRepositoryImpl implements OwnershipRepository {
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
    public OwnershipPojo create(final OwnershipPojo pojo) {
        final OwnershipRecord ownershipRecord = dslContext.newRecord(OWNERSHIP, pojo);
        ownershipRecord.store();
        return ownershipRecord.into(OwnershipPojo.class);
    }

    @Override
    public void delete(final long ownershipId) {
        dslContext.deleteFrom(OWNERSHIP)
            .where(OWNERSHIP.ID.eq(ownershipId))
            .execute();
    }

    @Override
    public OwnershipPojo updateRole(final long ownershipId, final long roleId) {
        return dslContext.update(OWNERSHIP)
            .set(OWNERSHIP.ROLE_ID, roleId)
            .where(OWNERSHIP.ID.eq(ownershipId))
            .returning()
            .fetchOptional()
            .orElseThrow(() -> new DataAccessException("Error updating ownership record with id = " + ownershipId))
            .into(OwnershipPojo.class);
    }

    @Override
    public void updateSearchVectors(final long ownershipId) {
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
