package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupEntityRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.GroupEntityRelationsRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_ENTITY_RELATIONS;

@Repository
@RequiredArgsConstructor
public class ReactiveGroupEntityRelationRepositoryImpl implements ReactiveGroupEntityRelationRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Flux<GroupEntityRelationsPojo> deleteRelationsForDEG(final String groupOddrn) {
        final var query = DSL.deleteFrom(GROUP_ENTITY_RELATIONS)
            .where(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(groupOddrn)
                .or(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(groupOddrn)))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(GroupEntityRelationsPojo.class));
    }

    @Override
    public Flux<GroupEntityRelationsPojo> deleteRelationsExcept(final String groupOddrn,
                                                                final List<String> oddrnsToKeep) {
        final var query = DSL.deleteFrom(GROUP_ENTITY_RELATIONS)
            .where(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(groupOddrn)
                .and(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.notIn(oddrnsToKeep)))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(GroupEntityRelationsPojo.class));
    }

    @Override
    public Flux<GroupEntityRelationsPojo> deleteRelations(final String groupOddrn, final String entityOddrn) {
        final var query = DSL.deleteFrom(GROUP_ENTITY_RELATIONS)
            .where(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(groupOddrn)
                .and(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(entityOddrn)))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(GroupEntityRelationsPojo.class));
    }

    @Override
    public Flux<GroupEntityRelationsPojo> createRelations(final String groupOddrn, final List<String> entityOddrns) {
        if (entityOddrns.isEmpty()) {
            return Flux.just();
        }

        final List<GroupEntityRelationsRecord> records = entityOddrns.stream()
            .map(enOddrn -> new GroupEntityRelationsPojo().setGroupOddrn(groupOddrn).setDataEntityOddrn(enOddrn))
            .map(p -> jooqReactiveOperations.newRecord(GROUP_ENTITY_RELATIONS, p))
            .toList();

        var insertStep = DSL.insertInto(GROUP_ENTITY_RELATIONS);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        return jooqReactiveOperations.flux(
            insertStep.set(records.get(records.size() - 1))
                .onDuplicateKeyIgnore()
                .returning(GROUP_ENTITY_RELATIONS.fields())
        ).map(r -> r.into(GroupEntityRelationsPojo.class));
    }
}
