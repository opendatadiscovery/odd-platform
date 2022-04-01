package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.opendatadiscovery.oddplatform.annotation.BlockingTransactional;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.OwnerRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.springframework.stereotype.Repository;

import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;

@Repository
public class OwnerRepositoryImpl
    extends AbstractSoftDeleteCRUDRepository<OwnerRecord, OwnerPojo>
    implements OwnerRepository {

    private final JooqFTSHelper jooqFTSHelper;

    public OwnerRepositoryImpl(final DSLContext dslContext,
                               final JooqQueryHelper jooqQueryHelper,
                               final JooqFTSHelper jooqFTSHelper) {
        super(dslContext, jooqQueryHelper, OWNER, OWNER.ID, OWNER.IS_DELETED, OWNER.NAME, OWNER.NAME,
            OWNER.UPDATED_AT, OwnerPojo.class);
        this.jooqFTSHelper = jooqFTSHelper;
    }

    @Override
    public Optional<OwnerPojo> getByName(final String name) {
        return dslContext.selectFrom(OWNER)
            .where(addSoftDeleteFilter(OWNER.NAME.eq(name)))
            .fetchOptionalInto(OwnerPojo.class);
    }

    @Override
    @BlockingTransactional
    public OwnerPojo createOrGet(final OwnerPojo owner) {
        return getByName(owner.getName()).orElseGet(() -> create(owner));
    }

    @Override
    @BlockingTransactional
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
