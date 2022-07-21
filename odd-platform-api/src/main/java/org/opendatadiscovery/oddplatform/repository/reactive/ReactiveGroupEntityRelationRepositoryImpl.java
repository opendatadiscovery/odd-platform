package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Field;
import org.jooq.Name;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupEntityRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.GroupEntityRelationsRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.name;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
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

    @Override
    public Mono<Map<String, List<String>>> fetchGroupRelations(final Collection<String> childOddrns) {
        if (CollectionUtils.isEmpty(childOddrns)) {
            return Mono.empty();
        }

        final var query = DSL
            .select(
                GROUP_ENTITY_RELATIONS.GROUP_ODDRN,
                GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN
            )
            .from(GROUP_ENTITY_RELATIONS)
            .where(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.in(childOddrns));
        return jooqReactiveOperations.flux(query).collect(Collectors.groupingBy(
            r -> r.get(GROUP_ENTITY_RELATIONS.GROUP_ODDRN),
            Collectors.mapping(r -> r.get(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN), Collectors.toList())
        ));
    }

    @Override
    public Flux<String> getDEGEntitiesOddrns(final long dataEntityGroupId) {
        final Name cteName = name("t");
        final Field<String> tDataEntityOddrn = field("t.data_entity_oddrn", String.class);

        final var groupOddrn = DSL.select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .where(DATA_ENTITY.ID.eq(dataEntityGroupId));

        final var cte = cteName.as(DSL
            .select(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN)
            .from(GROUP_ENTITY_RELATIONS)
            .where(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(groupOddrn))
            .unionAll(
                DSL
                    .select(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN)
                    .from(GROUP_ENTITY_RELATIONS)
                    .join(cteName).on(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(tDataEntityOddrn))
            ));

        final var query = DSL.withRecursive(cte)
            .selectDistinct(cte.field(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN))
            .from(cte.getName());

        return jooqReactiveOperations.flux(query).map(r -> r.into(String.class));
    }
}
