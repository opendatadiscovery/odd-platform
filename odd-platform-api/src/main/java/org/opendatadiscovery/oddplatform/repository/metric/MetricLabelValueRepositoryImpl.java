package org.opendatadiscovery.oddplatform.repository.metric;

import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.InsertSetStep;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.metric.MetricLabelValueDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MetricLabelValueRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.excluded;
import static org.opendatadiscovery.oddplatform.model.Keys.METRIC_LABEL_VALUE_VALUE_METRIC_LABEL_ID_KEY;
import static org.opendatadiscovery.oddplatform.model.Tables.METRIC_LABEL;
import static org.opendatadiscovery.oddplatform.model.Tables.METRIC_LABEL_VALUE;

@Repository
@RequiredArgsConstructor
public class MetricLabelValueRepositoryImpl implements MetricLabelValueRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Flux<MetricLabelValuePojo> getOrCreateMetricLabelValues(final List<MetricLabelValuePojo> metricLabelValues) {
        final List<MetricLabelValueRecord> records = metricLabelValues.stream()
            .map(pojo -> jooqReactiveOperations.newRecord(METRIC_LABEL_VALUE, pojo))
            .toList();
        return jooqReactiveOperations.executeInPartitionReturning(records, rs -> {
            InsertSetStep<MetricLabelValueRecord> insertStep = DSL.insertInto(METRIC_LABEL_VALUE);

            for (int i = 0; i < rs.size() - 1; i++) {
                insertStep = insertStep.set(rs.get(i)).newRecord();
            }

            return jooqReactiveOperations.flux(insertStep.set(rs.get(rs.size() - 1))
                .onConflictOnConstraint(METRIC_LABEL_VALUE_VALUE_METRIC_LABEL_ID_KEY)
                .doUpdate()
                .set(METRIC_LABEL_VALUE.VALUE, excluded(METRIC_LABEL_VALUE.VALUE))
                .returning(METRIC_LABEL_VALUE.fields()));
        }).map(r -> r.into(MetricLabelValuePojo.class));
    }

    @Override
    public Mono<List<MetricLabelValueDto>> getDtoByIds(final Set<Integer> ids) {
        if (CollectionUtils.isEmpty(ids)) {
            return Mono.just(List.of());
        }
        final SelectConditionStep<Record> query = DSL.select(METRIC_LABEL_VALUE.fields())
            .select(METRIC_LABEL.fields())
            .from(METRIC_LABEL_VALUE)
            .join(METRIC_LABEL).on(METRIC_LABEL.ID.eq(METRIC_LABEL_VALUE.METRIC_LABEL_ID))
            .where(METRIC_LABEL_VALUE.ID.in(ids));
        return jooqReactiveOperations.flux(query)
            .map(r -> new MetricLabelValueDto(
                r.into(METRIC_LABEL_VALUE).into(MetricLabelValuePojo.class),
                r.into(METRIC_LABEL).into(MetricLabelPojo.class)
            ))
            .collectList();
    }
}
