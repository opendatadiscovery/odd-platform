package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.jooq.CommonTableExpression;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.InsertValuesStep3;
import org.jooq.Name;
import org.jooq.Record;
import org.jooq.TableField;
import org.opendatadiscovery.oddplatform.annotation.BlockingTransactional;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageDepth;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.LineageRecord;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Repository;

import static java.util.stream.Collectors.toList;
import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.name;
import static org.jooq.impl.DSL.val;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.LINEAGE;

@Repository
@RequiredArgsConstructor
public class LineageRepositoryImpl implements LineageRepository {
    private final DSLContext dslContext;

    @Override
    @BlockingTransactional
    public void replaceLineagePaths(final List<LineagePojo> pojos) {
        final Set<String> establishers = pojos.stream()
            .map(LineagePojo::getEstablisherOddrn)
            .collect(Collectors.toSet());

        dslContext.deleteFrom(LINEAGE)
            .where(LINEAGE.ESTABLISHER_ODDRN.in(establishers))
            .execute();

        InsertValuesStep3<LineageRecord, String, String, String> step
            = dslContext.insertInto(LINEAGE, LINEAGE.PARENT_ODDRN, LINEAGE.CHILD_ODDRN, LINEAGE.ESTABLISHER_ODDRN);

        for (final LineagePojo p : pojos) {
            step = step.values(p.getParentOddrn(), p.getChildOddrn(), p.getEstablisherOddrn());
        }

        step.onDuplicateKeyIgnore().execute();
    }

    @Override
    public Optional<Long> getTargetsCount(final long dataEntityId) {
        return dslContext.selectCount()
            .from(LINEAGE)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(LINEAGE.PARENT_ODDRN))
            .where(DATA_ENTITY.ID.eq(dataEntityId))
            .fetchOptionalInto(Long.class);
    }

    @Override
    public List<LineagePojo> getLineageRelations(final Set<String> rootOddrns,
                                                 final LineageDepth depth,
                                                 final LineageStreamKind streamKind) {
        final var cte = lineageCte(rootOddrns, depth, streamKind);
        return collectLineage(cte);
    }

    private List<LineagePojo> collectLineage(final CommonTableExpression<Record> cte) {
        return dslContext.withRecursive(cte)
            .selectDistinct(cte.field(LINEAGE.PARENT_ODDRN), cte.field(LINEAGE.CHILD_ODDRN))
            .from(cte.getName())
            .fetchStreamInto(LineagePojo.class)
            .collect(toList());
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
            streamKind.equals(LineageStreamKind.DOWNSTREAM)
                ? Pair.of(LINEAGE.PARENT_ODDRN, tChildOddrn)
                : Pair.of(LINEAGE.CHILD_ODDRN, tParentOddrn);

        return cteName.as(dslContext
            .select(LINEAGE.asterisk())
            .select(startDepth)
            .from(LINEAGE)
            .where(conditions.getLeft().in(oddrns))
            .unionAll(
                dslContext
                    .select(LINEAGE.asterisk())
                    .select(tDepth.add(1))
                    .from(LINEAGE)
                    .join(cteName).on(conditions.getLeft().eq(conditions.getRight()))
                    .where(tDepth.lessThan(lineageDepth.getDepth()))
            ));
    }
}