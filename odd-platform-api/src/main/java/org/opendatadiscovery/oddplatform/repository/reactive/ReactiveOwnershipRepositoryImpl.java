package org.opendatadiscovery.oddplatform.repository.reactive;

import lombok.RequiredArgsConstructor;
import org.jooq.Record1;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.OwnershipRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.TITLE;

@Repository
@RequiredArgsConstructor
public class ReactiveOwnershipRepositoryImpl implements ReactiveOwnershipRepository {
    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqQueryHelper jooqQueryHelper;

    @Override
    public Mono<OwnershipDto> get(final long id) {
        final var query = DSL.select(OWNERSHIP.asterisk())
            .select(TITLE.asterisk())
            .select(OWNER.asterisk())
            .from(OWNERSHIP)
            .join(OWNER).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .join(TITLE).on(OWNERSHIP.TITLE_ID.eq(TITLE.ID))
            .where(OWNERSHIP.ID.eq(id));

        return jooqReactiveOperations.mono(query)
            .map(r -> OwnershipDto.builder()
                .ownership(r.into(OWNERSHIP).into(OwnershipPojo.class))
                .owner(r.into(OWNER).into(OwnerPojo.class))
                .title(r.into(TITLE).into(TitlePojo.class))
                .build());
    }

    @Override
    public Mono<OwnershipPojo> create(final OwnershipPojo pojo) {
        final OwnershipRecord ownershipRecord = jooqReactiveOperations.newRecord(OWNERSHIP, pojo);

        return jooqReactiveOperations
            .mono(DSL.insertInto(OWNERSHIP).set(ownershipRecord).returning())
            .map(r -> r.into(OwnershipPojo.class));
    }

    @Override
    public Mono<OwnershipPojo> delete(final long ownershipId) {
        final var query = DSL.deleteFrom(OWNERSHIP)
            .where(OWNERSHIP.ID.eq(ownershipId))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(OwnershipPojo.class));
    }

    @Override
    public Mono<OwnershipPojo> updateTitle(final long ownershipId, final long titleId) {
        final var query = DSL.update(OWNERSHIP)
            .set(OWNERSHIP.TITLE_ID, titleId)
            .where(OWNERSHIP.ID.eq(ownershipId))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(OwnershipPojo.class));
    }

    @Override
    public Mono<Boolean> existsByOwner(final long ownerId) {
        final var query = jooqQueryHelper.selectExists(
            DSL.selectFrom(OWNERSHIP)
                .where(OWNERSHIP.OWNER_ID.eq(ownerId))
        );

        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    @Override
    public Flux<OwnershipPojo> deleteByDataEntityId(final long dataEntityId) {
        final var query = DSL.deleteFrom(OWNERSHIP)
            .where(OWNERSHIP.DATA_ENTITY_ID.eq(dataEntityId))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(OwnershipPojo.class));
    }

    @Override
    public Flux<OwnershipDto> getOwnershipsByDataEntityId(final long dataEntityId) {
        final var query = DSL.select(OWNERSHIP.asterisk())
            .select(TITLE.asterisk())
            .select(OWNER.asterisk())
            .from(OWNERSHIP)
            .join(OWNER).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .join(TITLE).on(OWNERSHIP.TITLE_ID.eq(TITLE.ID))
            .where(OWNERSHIP.DATA_ENTITY_ID.eq(dataEntityId));

        return jooqReactiveOperations.flux(query)
            .map(r -> OwnershipDto.builder()
                .ownership(r.into(OWNERSHIP).into(OwnershipPojo.class))
                .owner(r.into(OWNER).into(OwnerPojo.class))
                .title(r.into(TITLE).into(TitlePojo.class))
                .build());
    }
}
