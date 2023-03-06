package org.opendatadiscovery.oddplatform.repository.metric;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.InsertSetStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricPointPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MetricPointRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import static org.jooq.impl.DSL.excluded;
import static org.opendatadiscovery.oddplatform.model.Tables.METRIC_POINT;

@Repository
@RequiredArgsConstructor
public class MetricPointRepositoryImpl implements MetricPointRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Flux<MetricPointPojo> createOrUpdatePoints(final List<MetricPointPojo> metricPoints) {
        final List<MetricPointRecord> records = metricPoints.stream()
            .map(pojo -> jooqReactiveOperations.newRecord(METRIC_POINT, pojo))
            .toList();
        return jooqReactiveOperations.executeInPartitionReturning(records, rs -> {
            InsertSetStep<MetricPointRecord> insertStep = DSL.insertInto(METRIC_POINT);
            for (int i = 0; i < rs.size() - 1; i++) {
                insertStep = insertStep.set(rs.get(i)).newRecord();
            }
            return jooqReactiveOperations.flux(insertStep.set(rs.get(rs.size() - 1))
                .onConflict(METRIC_POINT.SERIES_ID, METRIC_POINT.LABEL_VALUES_IDS)
                .doUpdate()
                .set(METRIC_POINT.VALUE, excluded(METRIC_POINT.VALUE))
                .set(METRIC_POINT.TIMESTAMP, excluded(METRIC_POINT.TIMESTAMP))
                .where(METRIC_POINT.TIMESTAMP.lessThan(excluded(METRIC_POINT.TIMESTAMP)))
                .returning(METRIC_POINT.fields()));
        }).map(r -> r.into(MetricPointPojo.class));
    }
}
