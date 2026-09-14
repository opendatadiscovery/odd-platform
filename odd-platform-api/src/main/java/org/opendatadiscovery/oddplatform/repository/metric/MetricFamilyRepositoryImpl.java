package org.opendatadiscovery.oddplatform.repository.metric;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.InsertSetStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MetricFamilyRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import static org.opendatadiscovery.oddplatform.model.Keys.METRIC_FAMILY_NAME_TYPE_UNIT_KEY;
import static org.opendatadiscovery.oddplatform.model.Tables.METRIC_FAMILY;

@Repository
@RequiredArgsConstructor
public class MetricFamilyRepositoryImpl implements MetricFamilyRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Flux<MetricFamilyPojo> createOrUpdateMetricFamilies(final Collection<MetricFamilyPojo> metricFamilies) {
        if (CollectionUtils.isEmpty(metricFamilies)) {
            return Flux.empty();
        }
        final List<MetricFamilyRecord> records = metricFamilies.stream()
            .map(pojo -> jooqReactiveOperations.newRecord(METRIC_FAMILY, pojo))
            .toList();
        return jooqReactiveOperations.executeInPartitionReturning(records, rs -> {
            InsertSetStep<MetricFamilyRecord> insertStep = DSL.insertInto(METRIC_FAMILY);

            for (int i = 0; i < rs.size() - 1; i++) {
                insertStep = insertStep.set(rs.get(i)).newRecord();
            }

            // DO UPDATE ... WHERE, not a plain DO UPDATE: the intent is "fill in a
            // description if the row does not have one yet, never overwrite one it
            // already does". But a WHERE clause on DO UPDATE also gates RETURNING --
            // Postgres skips the row entirely, update and RETURNING both, whenever the
            // condition does not hold. Ingesting the same metric family a second time
            // (now with a non-null description already stored) hit exactly that: no
            // row came back, the caller's Map<String, MetricFamilyPojo> ended up
            // missing an entry it will .get() further down, and that null exploded on
            // MetricFamilyPojo::getId with no clue this WHERE clause was the cause.
            // COALESCE keeps the "never overwrite" behaviour, as a value rather than a
            // condition, so DO UPDATE -- and RETURNING -- always fire.
            return jooqReactiveOperations.flux(insertStep.set(rs.get(rs.size() - 1))
                .onConflictOnConstraint(METRIC_FAMILY_NAME_TYPE_UNIT_KEY)
                .doUpdate()
                .set(METRIC_FAMILY.DESCRIPTION,
                    DSL.coalesce(METRIC_FAMILY.DESCRIPTION, DSL.excluded(METRIC_FAMILY.DESCRIPTION)))
                .returning(METRIC_FAMILY.fields()));
        }).map(r -> r.into(MetricFamilyPojo.class));
    }

    @Override
    public Flux<MetricFamilyPojo> getByIds(final Set<Integer> ids) {
        final var query = DSL.selectFrom(METRIC_FAMILY)
            .where(METRIC_FAMILY.ID.in(ids));
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(MetricFamilyPojo.class));
    }
}
