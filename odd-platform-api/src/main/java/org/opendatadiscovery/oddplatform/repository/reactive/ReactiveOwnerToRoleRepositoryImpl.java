package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Record1;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerToRolePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.OwnerToRoleRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.OWNER_TO_ROLE;

@Repository
@RequiredArgsConstructor
public class ReactiveOwnerToRoleRepositoryImpl implements ReactiveOwnerToRoleRepository {
    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqQueryHelper jooqQueryHelper;

    @Override
    public Mono<Void> createRelations(final long ownerId, final Collection<Long> roleIds) {
        if (CollectionUtils.isEmpty(roleIds)) {
            return Mono.empty();
        }
        final List<OwnerToRoleRecord> records = roleIds.stream()
            .map(roleId -> new OwnerToRolePojo(ownerId, roleId))
            .map(p -> jooqReactiveOperations.newRecord(OWNER_TO_ROLE, p))
            .toList();
        var insertStep = DSL.insertInto(OWNER_TO_ROLE);
        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }
        return jooqReactiveOperations.mono(insertStep
            .set(records.get(records.size() - 1))
            .onDuplicateKeyIgnore()
        ).then();
    }

    @Override
    public Mono<Boolean> isRoleAttachedToOwner(final long roleId) {
        final var query = jooqQueryHelper.selectExists(
            DSL.selectFrom(OWNER_TO_ROLE).where(OWNER_TO_ROLE.ROLE_ID.eq(roleId))
        );
        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    @Override
    public Mono<Void> deleteOwnerRelationsExcept(final long ownerId, final Collection<Long> roleIds) {
        final var query = DSL.delete(OWNER_TO_ROLE)
            .where(OWNER_TO_ROLE.OWNER_ID.eq(ownerId).and(OWNER_TO_ROLE.ROLE_ID.notIn(roleIds)));
        return jooqReactiveOperations.mono(query).then();
    }
}
