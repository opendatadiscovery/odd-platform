package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import com.provectus.oddplatform.model.tables.records.OwnerRecord;
import com.provectus.oddplatform.repository.util.JooqFTSHelper;
import com.provectus.oddplatform.repository.util.JooqQueryHelper;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
public class OwnerRepositoryImpl
    extends AbstractSoftDeleteCRUDRepository<OwnerRecord, OwnerPojo>
    implements OwnerRepository {

    private final JooqFTSHelper jooqFTSHelper;

    public OwnerRepositoryImpl(final DSLContext dslContext,
                               final JooqQueryHelper jooqQueryHelper,
                               final JooqFTSHelper jooqFTSHelper) {
        super(dslContext, jooqQueryHelper, OWNER, OWNER.ID, OWNER.IS_DELETED, OWNER.NAME, OWNER.NAME, OwnerPojo.class);
        this.jooqFTSHelper = jooqFTSHelper;
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

    @Override
    @Transactional
    public OwnerPojo update(final OwnerPojo pojo) {
        final OwnerPojo updatedOwner = super.update(pojo);

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
            .where(OWNER.ID.eq(updatedOwner.getId()));

        jooqFTSHelper.buildSearchEntrypointUpsert(
            vectorSelect,
            dataEntityId,
            vectorFields,
            SEARCH_ENTRYPOINT.OWNER_VECTOR,
            true,
            Map.of(ownerNameAlias, OWNER.NAME, roleNameAlias, ROLE.NAME)
        ).execute();

        return updatedOwner;
    }
}
