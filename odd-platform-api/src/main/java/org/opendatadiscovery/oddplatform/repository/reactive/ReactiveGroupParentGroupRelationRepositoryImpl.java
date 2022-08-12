package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupParentGroupRelationsPojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_PARENT_GROUP_RELATIONS;

@Repository
@RequiredArgsConstructor
public class ReactiveGroupParentGroupRelationRepositoryImpl implements ReactiveGroupParentGroupRelationRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Mono<Void> createRelations(final List<GroupParentGroupRelationsPojo> pojos) {
        return jooqReactiveOperations.executeInPartition(pojos, ps -> {
            var step = DSL.insertInto(
                GROUP_PARENT_GROUP_RELATIONS,
                GROUP_PARENT_GROUP_RELATIONS.GROUP_ODDRN,
                GROUP_PARENT_GROUP_RELATIONS.PARENT_GROUP_ODDRN
            );

            for (final GroupParentGroupRelationsPojo p : ps) {
                step = step.values(p.getGroupOddrn(), p.getParentGroupOddrn());
            }

            return jooqReactiveOperations.mono(step.onDuplicateKeyIgnore());
        });
    }
}
