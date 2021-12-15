package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.InsertValuesStep2;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupParentGroupRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.GroupParentGroupRelationsRecord;
import org.springframework.stereotype.Repository;

import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_PARENT_GROUP_RELATIONS;

@Repository
@RequiredArgsConstructor
public class GroupParentGroupRelationRepositoryImpl implements GroupParentGroupRelationRepository {
    private final DSLContext dslContext;

    @Override
    public void createRelations(final Collection<GroupParentGroupRelationsPojo> pojos) {
        var step = dslContext.insertInto(
            GROUP_PARENT_GROUP_RELATIONS,
            GROUP_PARENT_GROUP_RELATIONS.GROUP_ODDRN,
            GROUP_PARENT_GROUP_RELATIONS.PARENT_GROUP_ODDRN
        );

        for (final var p : pojos) {
            step = step.values(p.getGroupOddrn(), p.getParentGroupOddrn());
        }

        step.onDuplicateKeyIgnore().execute();
    }
}
