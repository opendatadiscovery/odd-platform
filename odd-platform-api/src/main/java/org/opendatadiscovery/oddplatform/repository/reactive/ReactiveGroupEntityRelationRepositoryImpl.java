package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Name;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.DataEntityGroupItemDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupEntityRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.GroupEntityRelationsRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
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
    private final JooqQueryHelper jooqQueryHelper;

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
    public Flux<GroupEntityRelationsPojo> deleteRelationsReturning(final String groupOddrn, final String entityOddrn) {
        final var query = DSL.deleteFrom(GROUP_ENTITY_RELATIONS)
            .where(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(groupOddrn)
                .and(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(entityOddrn)))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(GroupEntityRelationsPojo.class));
    }

    @Override
    public Flux<GroupEntityRelationsPojo> createRelationsReturning(final String groupOddrn,
                                                                   final List<String> entityOddrns) {
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
    public Flux<GroupEntityRelationsPojo> softDeleteRelationsForDeletedDataEntities(final List<String> oddrns) {
        final var query = DSL.update(GROUP_ENTITY_RELATIONS)
            .set(GROUP_ENTITY_RELATIONS.IS_DELETED, true)
            .where(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.in(oddrns)
                .or(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.in(oddrns)))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(GroupEntityRelationsPojo.class));
    }

    @Override
    public Flux<GroupEntityRelationsPojo> restoreRelationsForDataEntities(final List<String> oddrns) {
        final var query = DSL.update(GROUP_ENTITY_RELATIONS)
            .set(GROUP_ENTITY_RELATIONS.IS_DELETED, false)
            .where(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.in(oddrns)
                .or(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.in(oddrns)))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(GroupEntityRelationsPojo.class));
    }

    @Override
    public Mono<Void> deleteRelations(final List<GroupEntityRelationsPojo> pojos) {
        final List<String> groupOddrns = pojos.stream().map(GroupEntityRelationsPojo::getGroupOddrn).toList();
        final List<String> entityOddrns = pojos.stream().map(GroupEntityRelationsPojo::getDataEntityOddrn).toList();

        final var deleteQuery = DSL.deleteFrom(GROUP_ENTITY_RELATIONS)
            .where(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.in(groupOddrns))
            .and(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.notIn(entityOddrns));

        return jooqReactiveOperations.mono(deleteQuery).then();
    }

    @Override
    public Flux<GroupEntityRelationsPojo> getManuallyCreatedRelations(final String entityOddrn) {
        final SelectConditionStep<Record> query = DSL.select()
            .from(GROUP_ENTITY_RELATIONS)
            .join(DATA_ENTITY).on(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(DATA_ENTITY.ODDRN))
            .where(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(entityOddrn)
                .and(DATA_ENTITY.MANUALLY_CREATED.isTrue())
                .and(GROUP_ENTITY_RELATIONS.IS_DELETED.isFalse())
            );
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(GroupEntityRelationsPojo.class));
    }

    @Override
    public Mono<Void> createRelations(final List<GroupEntityRelationsPojo> pojos) {
        return jooqReactiveOperations.executeInPartition(pojos, ps -> {
            var step = DSL.insertInto(
                GROUP_ENTITY_RELATIONS,
                GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN,
                GROUP_ENTITY_RELATIONS.GROUP_ODDRN
            );

            for (final GroupEntityRelationsPojo p : ps) {
                step = step.values(p.getDataEntityOddrn(), p.getGroupOddrn());
            }

            return jooqReactiveOperations.mono(step.onDuplicateKeyIgnore());
        });
    }

    @Override
    public Mono<Map<String, List<String>>> fetchGroupRelations(final Collection<String> childOddrns) {
        if (CollectionUtils.isEmpty(childOddrns)) {
            return Mono.just(Map.of());
        }

        final var query = DSL
            .select(
                GROUP_ENTITY_RELATIONS.GROUP_ODDRN,
                GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN
            )
            .from(GROUP_ENTITY_RELATIONS)
            .where(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.in(childOddrns)
                .and(GROUP_ENTITY_RELATIONS.IS_DELETED.isFalse()));
        return jooqReactiveOperations.flux(query)
            .collect(Collectors.groupingBy(
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
            .where(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(groupOddrn)
                .and(GROUP_ENTITY_RELATIONS.IS_DELETED.isFalse()))
            .unionAll(
                DSL
                    .select(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN)
                    .from(GROUP_ENTITY_RELATIONS)
                    .join(cteName).on(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(tDataEntityOddrn))
                    .where(GROUP_ENTITY_RELATIONS.IS_DELETED.isFalse())
            ));

        final var query = DSL.withRecursive(cte)
            .selectDistinct(cte.field(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN))
            .from(cte.getName());

        return jooqReactiveOperations.flux(query).map(r -> r.into(String.class));
    }

    @Override
    public Flux<DataEntityGroupItemDto> getDEGItems(final Long dataEntityGroupId, final Integer page,
                                                    final Integer size, final String query) {
        final List<Condition> conditions = new ArrayList<>();
        if (StringUtils.isNotEmpty(query)) {
            conditions.add(DATA_ENTITY.INTERNAL_NAME.startsWithIgnoreCase(query)
                .or(DATA_ENTITY.EXTERNAL_NAME.startsWithIgnoreCase(query)));
        }

        final var groupOddrn = DSL.select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .where(DATA_ENTITY.ID.eq(dataEntityGroupId));

        final var entitiesSelect = DSL.select(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN, DSL.inline(false))
            .from(GROUP_ENTITY_RELATIONS)
            .join(DATA_ENTITY).on(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(DATA_ENTITY.ODDRN))
            .where(conditions).and(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(groupOddrn)
                .and(GROUP_ENTITY_RELATIONS.IS_DELETED.isFalse()))
            .orderBy(DATA_ENTITY.ID.desc());

        final var upperGroupsSelect = DSL.select(GROUP_ENTITY_RELATIONS.GROUP_ODDRN, DSL.inline(true))
            .from(GROUP_ENTITY_RELATIONS)
            .join(DATA_ENTITY).on(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(DATA_ENTITY.ODDRN))
            .where(conditions).and(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(groupOddrn)
                .and(GROUP_ENTITY_RELATIONS.IS_DELETED.isFalse()))
            .orderBy(DATA_ENTITY.ID.desc());

        final var resultQuery = entitiesSelect.unionAll(upperGroupsSelect)
            .limit(size)
            .offset((page - 1) * size);

        return jooqReactiveOperations.flux(resultQuery)
            .map(r -> new DataEntityGroupItemDto(r.component1(), r.value2()));
    }

    @Override
    public Mono<Long> getDEGEntitiesCount(final Long dataEntityGroupId, final String query) {
        final List<Condition> conditions = getSearchConditions(query);

        final var groupOddrn = DSL.select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .where(DATA_ENTITY.ID.eq(dataEntityGroupId));

        final var result = DSL.selectCount()
            .from(GROUP_ENTITY_RELATIONS)
            .join(DATA_ENTITY).on(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(DATA_ENTITY.ODDRN))
            .where(conditions).and(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(groupOddrn)
                .and(GROUP_ENTITY_RELATIONS.IS_DELETED.isFalse()));

        return jooqReactiveOperations.mono(result)
            .map(r -> r.value1().longValue());
    }

    @Override
    public Mono<Long> getDEGUpperGroupsCount(final Long dataEntityGroupId, final String query) {
        final List<Condition> conditions = getSearchConditions(query);

        final var groupOddrn = DSL.select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .where(DATA_ENTITY.ID.eq(dataEntityGroupId));

        final var result = DSL.selectCount()
            .from(GROUP_ENTITY_RELATIONS)
            .join(DATA_ENTITY).on(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(DATA_ENTITY.ODDRN))
            .where(conditions).and(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(groupOddrn)
                .and(GROUP_ENTITY_RELATIONS.IS_DELETED.isFalse()));

        return jooqReactiveOperations.mono(result)
            .map(r -> r.value1().longValue());
    }

    private List<Condition> getSearchConditions(final String query) {
        final List<Condition> conditions = new ArrayList<>();
        if (StringUtils.isNotEmpty(query)) {
            conditions.add(DATA_ENTITY.INTERNAL_NAME.startsWithIgnoreCase(query)
                .or(DATA_ENTITY.EXTERNAL_NAME.startsWithIgnoreCase(query)));
        }
        return conditions;
    }
}
