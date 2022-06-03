package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.term.TermOwnershipDto;
import org.opendatadiscovery.oddplatform.model.tables.TermOwnership;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermOwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.OwnershipRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.TermOwnershipRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_OWNERSHIP;

@Repository
@RequiredArgsConstructor
public class ReactiveTermOwnershipRepositoryImpl implements ReactiveTermOwnershipRepository {

    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqQueryHelper jooqQueryHelper;

    @Override
    public Mono<TermOwnershipDto> get(final long id) {
        final var query = DSL.select(TERM_OWNERSHIP.asterisk())
            .select(ROLE.asterisk())
            .select(OWNER.asterisk())
            .from(TERM_OWNERSHIP)
            .join(OWNER).on(TERM_OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .join(ROLE).on(TERM_OWNERSHIP.ROLE_ID.eq(ROLE.ID))
            .where(TERM_OWNERSHIP.ID.eq(id));

        return jooqReactiveOperations.mono(query)
            .map(r -> new TermOwnershipDto(
                r.into(TERM_OWNERSHIP).into(TermOwnershipPojo.class),
                r.into(OWNER).into(OwnerPojo.class),
                r.into(ROLE).into(RolePojo.class)
            ));
    }

    @Override
    public Mono<TermOwnershipPojo> create(final TermOwnershipPojo pojo) {
        final TermOwnershipRecord ownershipRecord = jooqReactiveOperations.newRecord(TERM_OWNERSHIP, pojo);

        return jooqReactiveOperations
            .mono(DSL.insertInto(TERM_OWNERSHIP).set(ownershipRecord).returning())
            .map(r -> r.into(TermOwnershipPojo.class));
    }

    @Override
    public Mono<TermOwnershipPojo> delete(final long ownershipId) {
        final var query = DSL.update(TERM_OWNERSHIP)
            .set(TERM_OWNERSHIP.DELETED_AT, LocalDateTime.now())
            .where(TERM_OWNERSHIP.ID.eq(ownershipId))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(TermOwnershipPojo.class));
    }

    @Override
    public Mono<TermOwnershipPojo> updateRole(final long ownershipId, final long roleId) {
        final var query = DSL.update(TERM_OWNERSHIP)
            .set(TERM_OWNERSHIP.ROLE_ID, roleId)
            .where(TERM_OWNERSHIP.ID.eq(ownershipId))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(TermOwnershipPojo.class));
    }

    @Override
    public Mono<Boolean> existsByOwner(final long ownerId) {
        final var query = jooqQueryHelper.selectExists(
            DSL.selectFrom(TERM_OWNERSHIP)
                .where(TERM_OWNERSHIP.OWNER_ID.eq(ownerId))
                .and(TERM_OWNERSHIP.DELETED_AT.isNull())
        );

        return jooqReactiveOperations.mono(query).map(r -> r.get(0, Boolean.class));
    }
}
