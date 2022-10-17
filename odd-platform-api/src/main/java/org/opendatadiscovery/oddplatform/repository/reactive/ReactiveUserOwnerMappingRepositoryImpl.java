package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
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
public class ReactiveUserOwnerMappingRepositoryImpl implements ReactiveUserOwnerMappingRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Mono<UserOwnerMappingPojo> createRelation(final String oidcUsername,
                                                     final String provider,
                                                     final Long ownerId) {
        final var query = DSL.insertInto(USER_OWNER_MAPPING)
            .values(ownerId, oidcUsername, provider)
            .onConflict(USER_OWNER_MAPPING.OWNER_ID).doUpdate()
            .set(USER_OWNER_MAPPING.OWNER_ID, ownerId)
            .set(USER_OWNER_MAPPING.OIDC_USERNAME, oidcUsername)
            .set(USER_OWNER_MAPPING.PROVIDER, provider)
            .returning();

        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(UserOwnerMappingPojo.class));
    }

    @Override
    public Mono<UserOwnerMappingPojo> deleteRelation(final String oidcUsername,
                                                     final String provider) {
        final var query = DSL.deleteFrom(USER_OWNER_MAPPING)
            .where(getConditions(oidcUsername, provider))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(UserOwnerMappingPojo.class));
    }

    @Override
    public Mono<OwnerPojo> getAssociatedOwner(final String oidcUsername,
                                              final String provider) {
        final var query = DSL.select(OWNER.asterisk())
            .from(USER_OWNER_MAPPING)
            .join(OWNER).on(USER_OWNER_MAPPING.OWNER_ID.eq(OWNER.ID))
            .where(getConditions(oidcUsername, provider));
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(OwnerPojo.class));
    }

    private List<Condition> getConditions(final String oidcUsername,
                                          final String provider) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(USER_OWNER_MAPPING.OIDC_USERNAME.eq(oidcUsername));
        if (StringUtils.isNotEmpty(provider)) {
            conditions.add(USER_OWNER_MAPPING.PROVIDER.eq(provider));
        } else {
            conditions.add(USER_OWNER_MAPPING.PROVIDER.isNull());
        }
        return conditions;
    }
}
