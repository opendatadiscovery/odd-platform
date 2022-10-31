package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.RoleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.UserOwnerMappingPojo;
import org.opendatadiscovery.oddplatform.repository.mapper.RoleRecordMapper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER_TO_ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.POLICY;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE_TO_POLICY;
import static org.opendatadiscovery.oddplatform.model.Tables.USER_OWNER_MAPPING;

@Repository
@RequiredArgsConstructor
public class ReactiveUserOwnerMappingRepositoryImpl implements ReactiveUserOwnerMappingRepository {
    private static final String AGG_POLICY_FIELD = "policy_relations";
    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqQueryHelper jooqQueryHelper;
    private final RoleRecordMapper roleRecordMapper;

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

    @Override
    public Mono<Boolean> isOwnerAssociated(final Long ownerId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.select()
                .from(USER_OWNER_MAPPING)
                .where(USER_OWNER_MAPPING.OWNER_ID.eq(ownerId))
        );
        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    @Override
    public Mono<List<RoleDto>> getUserRolesByOwner(final String username, final String provider) {
        final var query = DSL.select(ROLE.fields())
            .select(jsonArrayAgg(field(POLICY.asterisk().toString())).as(AGG_POLICY_FIELD))
            .from(ROLE)
            .leftJoin(ROLE_TO_POLICY).on(ROLE.ID.eq(ROLE_TO_POLICY.ROLE_ID))
            .leftJoin(POLICY).on(ROLE_TO_POLICY.POLICY_ID.eq(POLICY.ID))
            .join(OWNER_TO_ROLE).on(ROLE.ID.eq(OWNER_TO_ROLE.ROLE_ID))
            .join(USER_OWNER_MAPPING).on(USER_OWNER_MAPPING.OWNER_ID.eq(OWNER_TO_ROLE.OWNER_ID))
            .where(getConditions(username, provider))
            .groupBy(ROLE.fields());
        return jooqReactiveOperations.flux(query)
            .map(r -> roleRecordMapper.mapRecordToDto(r, AGG_POLICY_FIELD))
            .collectList();
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
