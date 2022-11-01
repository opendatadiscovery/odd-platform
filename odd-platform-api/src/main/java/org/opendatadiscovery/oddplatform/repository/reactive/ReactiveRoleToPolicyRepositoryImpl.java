package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Record1;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RoleToPolicyPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.RoleToPolicyRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.ROLE_TO_POLICY;

@Repository
@RequiredArgsConstructor
public class ReactiveRoleToPolicyRepositoryImpl implements ReactiveRoleToPolicyRepository {
    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqQueryHelper jooqQueryHelper;

    @Override
    public Mono<Void> createRelations(final long roleId, final Collection<Long> policyIds) {
        if (CollectionUtils.isEmpty(policyIds)) {
            return Mono.empty();
        }
        final List<RoleToPolicyRecord> records = policyIds.stream()
            .map(policyId -> new RoleToPolicyPojo(roleId, policyId))
            .map(p -> jooqReactiveOperations.newRecord(ROLE_TO_POLICY, p))
            .toList();
        var insertStep = DSL.insertInto(ROLE_TO_POLICY);
        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }
        return jooqReactiveOperations.mono(insertStep
            .set(records.get(records.size() - 1))
            .onDuplicateKeyIgnore()
        ).then();
    }

    @Override
    public Mono<Boolean> isPolicyAttachedToRole(final long policyId) {
        final var query = jooqQueryHelper.selectExists(
            DSL.selectFrom(ROLE_TO_POLICY).where(ROLE_TO_POLICY.POLICY_ID.eq(policyId))
        );
        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    @Override
    public Mono<Void> deleteRoleRelationsExcept(final long roleId, final Collection<Long> policyIds) {
        final var query = DSL.delete(ROLE_TO_POLICY)
            .where(ROLE_TO_POLICY.ROLE_ID.eq(roleId).and(ROLE_TO_POLICY.POLICY_ID.notIn(policyIds)));
        return jooqReactiveOperations.mono(query).then();
    }
}
