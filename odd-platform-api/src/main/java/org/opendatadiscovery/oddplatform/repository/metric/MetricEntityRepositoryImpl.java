package org.opendatadiscovery.oddplatform.repository.metric;

import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.InsertSetStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MetricEntityRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import static org.opendatadiscovery.oddplatform.model.Tables.METRIC_ENTITY;

@Repository
@RequiredArgsConstructor
public class MetricEntityRepositoryImpl implements MetricEntityRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Flux<MetricEntityPojo> registerMetricEntityOddrns(final Set<String> oddrns) {
        if (CollectionUtils.isEmpty(oddrns)) {
            return Flux.empty();
        }
        final List<MetricEntityRecord> records = oddrns.stream()
            .map(oddrn -> new MetricEntityPojo().setEntityOddrn(oddrn))
            .map(pojo -> jooqReactiveOperations.newRecord(METRIC_ENTITY, pojo))
            .toList();
        return jooqReactiveOperations.executeInPartitionReturning(records, rs -> {
            InsertSetStep<MetricEntityRecord> insertStep = DSL.insertInto(METRIC_ENTITY);

            for (int i = 0; i < rs.size() - 1; i++) {
                insertStep = insertStep.set(rs.get(i)).newRecord();
            }

            return jooqReactiveOperations.flux(insertStep.set(rs.get(rs.size() - 1))
                .onConflict(METRIC_ENTITY.ENTITY_ODDRN)
                .doUpdate()
                .set(METRIC_ENTITY.ENTITY_ODDRN, DSL.excluded(METRIC_ENTITY.ENTITY_ODDRN))
                .returning(METRIC_ENTITY.fields()));
        }).map(r -> r.into(MetricEntityPojo.class));
    }
}
