package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.CommonTableExpression;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.InsertValuesStep3;
import org.jooq.Name;
import org.jooq.Record;
import org.jooq.Record2;
import org.jooq.TableField;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageDepth;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.LineageRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.count;
import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.name;
import static org.jooq.impl.DSL.one;
import static org.jooq.impl.DSL.val;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.LINEAGE;

@Repository
@RequiredArgsConstructor
public class ReactiveLineageRepositoryImpl implements ReactiveLineageRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Flux<LineagePojo> batchDeleteByEstablisherOddrn(final Collection<String> establishers) {
        final var query = DSL.deleteFrom(LINEAGE)
            .where(LINEAGE.ESTABLISHER_ODDRN.in(establishers));
        return jooqReactiveOperations.flux(query.returning()).map(r -> r.into(LineagePojo.class));
    }

    @Override
    public Flux<LineagePojo> batchInsertLineages(final List<LineagePojo> pojos) {
        InsertValuesStep3<LineageRecord, String, String, String> step
            = DSL.insertInto(LINEAGE, LINEAGE.PARENT_ODDRN, LINEAGE.CHILD_ODDRN, LINEAGE.ESTABLISHER_ODDRN);

        for (final LineagePojo p : pojos) {
            step = step.values(p.getParentOddrn(), p.getChildOddrn(), p.getEstablisherOddrn());
        }
        return jooqReactiveOperations.flux(step.onDuplicateKeyIgnore().returning()).map(r -> r.into(LineagePojo.class));
    }

    @Override
    public Mono<Map<String, Long>> getTargetsCount(final Set<String> oddrns) {
        final var query = DSL.select(LINEAGE.PARENT_ODDRN)
            .select(count(one()).cast(Long.class))
            .from(LINEAGE)
            .where(LINEAGE.PARENT_ODDRN.in(oddrns).and(LINEAGE.IS_DELETED.isFalse()))
            .groupBy(LINEAGE.PARENT_ODDRN);
        return jooqReactiveOperations.flux(query)
            .collectMap(r -> r.get(0, String.class), r -> r.get(1, Long.class));
    }

    @Override
    public Mono<Map<String, Integer>> getChildrenCount(final Set<String> oddrns) {
        final Field<Integer> childrenCount = countDistinct(LINEAGE.CHILD_ODDRN).as("children_count");
        final var query = DSL.select(LINEAGE.PARENT_ODDRN, childrenCount)
            .from(LINEAGE)
            .where(LINEAGE.PARENT_ODDRN.in(oddrns).and(LINEAGE.IS_DELETED.isFalse()))
            .groupBy(LINEAGE.PARENT_ODDRN);
        return jooqReactiveOperations.flux(query).collectMap(Record2::value1, Record2::value2);
    }

    @Override
    public Mono<Map<String, Integer>> getParentCount(final Set<String> oddrns) {
        final Field<Integer> parentsCount = countDistinct(LINEAGE.PARENT_ODDRN).as("parents_count");
        final var query = DSL.select(LINEAGE.CHILD_ODDRN, parentsCount)
            .from(LINEAGE)
            .where(LINEAGE.CHILD_ODDRN.in(oddrns).and(LINEAGE.IS_DELETED.isFalse()))
            .groupBy(LINEAGE.CHILD_ODDRN);
        return jooqReactiveOperations.flux(query).collectMap(Record2::value1, Record2::value2);
    }

    @Override
    public Flux<LineagePojo> softDeleteLineageRelations(final List<String> dataEntityOddrns) {
        final var query = DSL.update(LINEAGE)
            .set(LINEAGE.IS_DELETED, true)
            .where(LINEAGE.CHILD_ODDRN.in(dataEntityOddrns).or(LINEAGE.PARENT_ODDRN.in(dataEntityOddrns)))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(LineagePojo.class));
    }

    @Override
    public Flux<LineagePojo> restoreLineageRelations(final List<String> dataEntityOddrns) {
        final var query = DSL.update(LINEAGE)
            .set(LINEAGE.IS_DELETED, false)
            .where(LINEAGE.CHILD_ODDRN.in(dataEntityOddrns).or(LINEAGE.PARENT_ODDRN.in(dataEntityOddrns)))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(LineagePojo.class));
    }

    @Override
    public Flux<LineagePojo> getLineageRelations(final List<String> oddrns) {
        final var query = DSL.selectDistinct(LINEAGE.PARENT_ODDRN, LINEAGE.CHILD_ODDRN)
            .from(LINEAGE)
            .where(LINEAGE.IS_DELETED.isFalse()
                .and(LINEAGE.PARENT_ODDRN.in(oddrns).and(LINEAGE.CHILD_ODDRN.in(oddrns))
                    .or(LINEAGE.CHILD_ODDRN.in(oddrns).and(LINEAGE.PARENT_ODDRN.in(oddrns)))));
        return jooqReactiveOperations.flux(query).map(r -> r.into(LineagePojo.class));
    }

    @Override
    public Flux<LineagePojo> getLineageRelations(final Set<String> rootOddrns,
                                                 final LineageDepth depth,
                                                 final LineageStreamKind streamKind) {
        final var cte = lineageCte(rootOddrns, depth, streamKind);
        final var query = DSL.withRecursive(cte)
            .selectDistinct(cte.field(LINEAGE.PARENT_ODDRN), cte.field(LINEAGE.CHILD_ODDRN))
            .from(cte.getName());
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(LineagePojo.class));
    }

    @Override
    public Flux<LineagePojo> getLineageRelationsForDepthOne(final List<Long> rootIds,
                                                            final LineageStreamKind streamKind) {
        if (CollectionUtils.isEmpty(rootIds)) {
            return Flux.empty();
        }
        final Condition joinCondition = streamKind == LineageStreamKind.DOWNSTREAM
            ? DATA_ENTITY.ODDRN.eq(LINEAGE.PARENT_ODDRN)
            : DATA_ENTITY.ODDRN.eq(LINEAGE.CHILD_ODDRN);
        final var query = DSL.selectDistinct(LINEAGE.PARENT_ODDRN, LINEAGE.CHILD_ODDRN)
            .from(LINEAGE)
            .join(DATA_ENTITY).on(joinCondition)
            .where(DATA_ENTITY.ID.in(rootIds).and(LINEAGE.IS_DELETED.isFalse()));
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(LineagePojo.class));
    }

    private CommonTableExpression<Record> lineageCte(final Collection<String> oddrns,
                                                     final LineageDepth lineageDepth,
                                                     final LineageStreamKind streamKind) {
        final Name cteName = name("t");
        final Field<Integer> startDepth = val(1).as(field("depth", Integer.class));
        final Field<Integer> tDepth = field("t.depth", Integer.class);
        final Field<String> tChildOddrn = field("t.child_oddrn", String.class);
        final Field<String> tParentOddrn = field("t.parent_oddrn", String.class);

        final Pair<TableField<LineageRecord, String>, Field<String>> conditions =
            streamKind == LineageStreamKind.DOWNSTREAM ? Pair.of(LINEAGE.PARENT_ODDRN, tChildOddrn)
                : Pair.of(LINEAGE.CHILD_ODDRN, tParentOddrn);

        return cteName.as(DSL
            .select(LINEAGE.asterisk())
            .select(startDepth)
            .from(LINEAGE)
            .where(conditions.getLeft().in(oddrns).and(LINEAGE.IS_DELETED.isFalse()))
            .unionAll(
                DSL
                    .select(LINEAGE.asterisk())
                    .select(tDepth.add(1))
                    .from(LINEAGE)
                    .join(cteName).on(conditions.getLeft().eq(conditions.getRight()))
                    .where(tDepth.lessThan(lineageDepth.getDepth()).and(LINEAGE.IS_DELETED.isFalse()))
            ));
    }
}
