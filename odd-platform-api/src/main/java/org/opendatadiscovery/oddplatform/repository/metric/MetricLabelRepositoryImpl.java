package org.opendatadiscovery.oddplatform.repository.metric;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.InsertSetStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MetricLabelRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import static org.jooq.impl.DSL.excluded;
import static org.opendatadiscovery.oddplatform.model.Tables.METRIC_LABEL;

@Repository
@RequiredArgsConstructor
public class MetricLabelRepositoryImpl implements MetricLabelRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Flux<MetricLabelPojo> getOrCreateMetricLabels(final List<MetricLabelPojo> metricLabels) {
        final List<MetricLabelRecord> records = metricLabels.stream()
            .map(pojo -> jooqReactiveOperations.newRecord(METRIC_LABEL, pojo))
            .toList();
        return jooqReactiveOperations.executeInPartitionReturning(records, rs -> {
            InsertSetStep<MetricLabelRecord> insertStep = DSL.insertInto(METRIC_LABEL);

            for (int i = 0; i < rs.size() - 1; i++) {
                insertStep = insertStep.set(rs.get(i)).newRecord();
            }

            return jooqReactiveOperations.flux(insertStep.set(rs.get(rs.size() - 1))
                .onConflict(METRIC_LABEL.NAME)
                .doUpdate()
                .set(METRIC_LABEL.NAME, excluded(METRIC_LABEL.NAME))
                .returning(METRIC_LABEL.fields()));
        }).map(r -> r.into(MetricLabelPojo.class));
    }
}
