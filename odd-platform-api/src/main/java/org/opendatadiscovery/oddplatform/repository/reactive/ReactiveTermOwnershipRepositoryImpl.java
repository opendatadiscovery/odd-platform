package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.jooq.Record1;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.term.TermOwnershipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermOwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.TermOwnershipRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.TITLE;

@Repository
@RequiredArgsConstructor
public class ReactiveTermOwnershipRepositoryImpl implements ReactiveTermOwnershipRepository {

    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqQueryHelper jooqQueryHelper;

    @Override
    public Mono<TermOwnershipDto> get(final long id) {
        final var query = DSL.select(TERM_OWNERSHIP.asterisk())
            .select(TITLE.asterisk())
            .select(OWNER.asterisk())
            .from(TERM_OWNERSHIP)
            .join(OWNER).on(TERM_OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .join(TITLE).on(TERM_OWNERSHIP.TITLE_ID.eq(TITLE.ID))
            .where(TERM_OWNERSHIP.ID.eq(id));

        return jooqReactiveOperations.mono(query)
            .map(r -> new TermOwnershipDto(
                r.into(TERM_OWNERSHIP).into(TermOwnershipPojo.class),
                r.into(OWNER).into(OwnerPojo.class),
                r.into(TITLE).into(TitlePojo.class)
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
    public Mono<TermOwnershipPojo> updateTitle(final long ownershipId, final long titleId) {
        final var query = DSL.update(TERM_OWNERSHIP)
            .set(TERM_OWNERSHIP.TITLE_ID, titleId)
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

        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }
}
