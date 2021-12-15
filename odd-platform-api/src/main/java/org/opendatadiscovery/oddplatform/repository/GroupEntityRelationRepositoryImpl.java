package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupEntityRelationsPojo;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_ENTITY_RELATIONS;

@Repository
@RequiredArgsConstructor
public class GroupEntityRelationRepositoryImpl implements GroupEntityRelationRepository {
    private final DSLContext dslContext;

    @Override
    @Transactional
    public void createOrUpdateRelations(final Collection<GroupEntityRelationsPojo> pojos) {
        final List<String> groupOddrns = pojos.stream().map(GroupEntityRelationsPojo::getGroupOddrn)
            .toList();
        final List<String> entityOddrns = pojos.stream().map(GroupEntityRelationsPojo::getDataEntityOddrn)
            .toList();

        dslContext.deleteFrom(GROUP_ENTITY_RELATIONS)
            .where(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.in(groupOddrns)
                .and(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.notIn(entityOddrns)))
            .execute();

        var step = dslContext.insertInto(
            GROUP_ENTITY_RELATIONS,
            GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN,
            GROUP_ENTITY_RELATIONS.GROUP_ODDRN
        );

        for (final var p : pojos) {
            step = step.values(p.getDataEntityOddrn(), p.getGroupOddrn());
        }

        step.onDuplicateKeyIgnore().execute();
    }
}