package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.PolicyPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.PolicyRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.POLICY;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE_TO_POLICY;

@Repository
public class ReactivePolicyRepositoryImpl extends ReactiveAbstractSoftDeleteCRUDRepository<PolicyRecord, PolicyPojo>
    implements ReactivePolicyRepository {

    public ReactivePolicyRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                        final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, POLICY, PolicyPojo.class);
    }

    @Override
    public Mono<List<PolicyPojo>> getRolesPolicies(final List<Long> roleIds) {
        if (CollectionUtils.isEmpty(roleIds)) {
            return Mono.just(List.of());
        }
        final SelectConditionStep<Record> query = DSL.select(POLICY.fields())
            .from(POLICY)
            .join(ROLE_TO_POLICY).on(ROLE_TO_POLICY.POLICY_ID.eq(POLICY.ID))
            .where(ROLE_TO_POLICY.ROLE_ID.in(roleIds));
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(PolicyPojo.class))
            .collectList();
    }
}
