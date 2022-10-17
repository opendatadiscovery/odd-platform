package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.model.tables.pojos.PolicyPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.PolicyRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;

import static org.opendatadiscovery.oddplatform.model.Tables.POLICY;

@Repository
public class ReactivePolicyRepositoryImpl extends ReactiveAbstractSoftDeleteCRUDRepository<PolicyRecord, PolicyPojo>
    implements ReactivePolicyRepository {

    public ReactivePolicyRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                        final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, POLICY, PolicyPojo.class);
    }
}
