package org.opendatadiscovery.oddplatform.repository;

import lombok.RequiredArgsConstructor;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.UserOwnerMappingPojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.USER_OWNER_MAPPING;

@Repository
@RequiredArgsConstructor
public class UserOwnerMappingRepositoryImpl implements UserOwnerMappingRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Mono<UserOwnerMappingPojo> createRelation(final String oidcUsername, final Long ownerId) {
        final var query = DSL.insertInto(USER_OWNER_MAPPING)
            .values(ownerId, oidcUsername)
            .onConflict(USER_OWNER_MAPPING.OWNER_ID).doUpdate()
            .set(USER_OWNER_MAPPING.OWNER_ID, ownerId)
            .set(USER_OWNER_MAPPING.OIDC_USERNAME, oidcUsername)
            .returning();

        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(UserOwnerMappingPojo.class));
    }

    @Override
    public Mono<UserOwnerMappingPojo> deleteRelation(final String oidcUsername) {
        final var query = DSL.deleteFrom(USER_OWNER_MAPPING)
            .where(USER_OWNER_MAPPING.OIDC_USERNAME.eq(oidcUsername))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(UserOwnerMappingPojo.class));
    }

    @Override
    public Mono<OwnerPojo> getAssociatedOwner(final String oidcUsername) {
        final var query = DSL.select(OWNER.asterisk())
            .from(USER_OWNER_MAPPING)
            .join(OWNER).on(USER_OWNER_MAPPING.OWNER_ID.eq(OWNER.ID))
            .where(USER_OWNER_MAPPING.OIDC_USERNAME.eq(oidcUsername));
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(OwnerPojo.class));
    }
}
