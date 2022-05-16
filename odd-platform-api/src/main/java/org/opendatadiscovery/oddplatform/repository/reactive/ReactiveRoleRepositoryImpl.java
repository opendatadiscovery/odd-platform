package org.opendatadiscovery.oddplatform.repository.reactive;

import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.RoleRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;

@Repository
public class ReactiveRoleRepositoryImpl extends ReactiveAbstractSoftDeleteCRUDRepository<RoleRecord, RolePojo>
    implements ReactiveRoleRepository {

    public ReactiveRoleRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                      final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, ROLE, RolePojo.class);
    }

    @Override
    public Mono<RolePojo> getByName(final String name) {
        return jooqReactiveOperations
            .mono(DSL.selectFrom(ROLE).where(addSoftDeleteFilter(ROLE.NAME.eq(name))))
            .map(this::recordToPojo);
    }
}
