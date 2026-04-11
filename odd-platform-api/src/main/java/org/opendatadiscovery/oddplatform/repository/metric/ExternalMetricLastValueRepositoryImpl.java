package org.opendatadiscovery.oddplatform.repository.metric;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.SetValuedMap;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.InsertSetStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.metric.ExternalMetricLastValueDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ExternalMetricLastValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.ExternalMetricLastValueRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import static org.opendatadiscovery.oddplatform.model.Keys.EXTERNAL_METRIC_LAST_VALUE_KEY;
import static org.opendatadiscovery.oddplatform.model.Tables.EXTERNAL_METRIC_LAST_VALUE;
import static org.opendatadiscovery.oddplatform.model.Tables.METRIC_FAMILY;

@Repository
@RequiredArgsConstructor
public class ExternalMetricLastValueRepositoryImpl implements ExternalMetricLastValueRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Flux<ExternalMetricLastValuePojo> createOrUpdateLastValues(final List<ExternalMetricLastValuePojo> pojos) {
        if (CollectionUtils.isEmpty(pojos)) {
            return Flux.empty();
        }
        final List<ExternalMetricLastValueRecord> records = pojos.stream()
            .map(pojo -> jooqReactiveOperations.newRecord(EXTERNAL_METRIC_LAST_VALUE, pojo))
            .toList();
        return jooqReactiveOperations.executeInPartitionReturning(records, rs -> {
            InsertSetStep<ExternalMetricLastValueRecord> insertStep = DSL.insertInto(EXTERNAL_METRIC_LAST_VALUE);

            for (int i = 0; i < rs.size() - 1; i++) {
                insertStep = insertStep.set(rs.get(i)).newRecord();
            }

            return jooqReactiveOperations.flux(insertStep.set(rs.get(rs.size() - 1))
                .onConflictOnConstraint(EXTERNAL_METRIC_LAST_VALUE_KEY)
                .doUpdate()
                .set(EXTERNAL_METRIC_LAST_VALUE.TIMESTAMP, DSL.excluded(EXTERNAL_METRIC_LAST_VALUE.TIMESTAMP))
                .returning(EXTERNAL_METRIC_LAST_VALUE.fields()));
        }).map(r -> r.into(ExternalMetricLastValuePojo.class));
    }

    @Override
    public Flux<ExternalMetricLastValuePojo> getCurrentLastValues(final SetValuedMap<String, Integer> oddrnFamilies) {
        final Condition condition = oddrnFamilies.entries().stream()
            .map(entry -> EXTERNAL_METRIC_LAST_VALUE.ODDRN.eq(entry.getKey())
                .and(EXTERNAL_METRIC_LAST_VALUE.METRIC_FAMILY_ID.eq(entry.getValue())))
            .reduce(Condition::or)
            .orElseThrow(() -> new IllegalStateException("Can't build condition for last value query"));
        final var query = DSL.selectFrom(EXTERNAL_METRIC_LAST_VALUE)
            .where(condition);
        return jooqReactiveOperations.flux(query).map(r -> r.into(ExternalMetricLastValuePojo.class));
    }

    @Override
    public Flux<ExternalMetricLastValueDto> getByOddrn(final String oddrn) {
        final List<Field<?>> selectFields = Stream
            .of(
                EXTERNAL_METRIC_LAST_VALUE.fields(),
                METRIC_FAMILY.fields()
            )
            .flatMap(Arrays::stream).toList();
        final var query = DSL.select(selectFields)
            .from(EXTERNAL_METRIC_LAST_VALUE)
            .join(METRIC_FAMILY).on(EXTERNAL_METRIC_LAST_VALUE.METRIC_FAMILY_ID.eq(METRIC_FAMILY.ID))
            .where(EXTERNAL_METRIC_LAST_VALUE.ODDRN.eq(oddrn));
        return jooqReactiveOperations.flux(query)
            .map(r -> {
                final ExternalMetricLastValuePojo valuePojo = r.into(EXTERNAL_METRIC_LAST_VALUE)
                    .into(ExternalMetricLastValuePojo.class);
                final MetricFamilyPojo familyPojo = r.into(METRIC_FAMILY).into(MetricFamilyPojo.class);
                return new ExternalMetricLastValueDto(valuePojo, familyPojo);
            });
    }
}
