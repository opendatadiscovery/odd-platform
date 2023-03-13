package org.opendatadiscovery.oddplatform.repository.metric;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.jooq.InsertSetStep;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesDto;
import org.opendatadiscovery.oddplatform.model.Keys;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricPointPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricSeriesPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MetricSeriesRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import static org.jooq.impl.DSL.excluded;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.opendatadiscovery.oddplatform.model.Tables.METRIC_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.METRIC_POINT;
import static org.opendatadiscovery.oddplatform.model.Tables.METRIC_SERIES;

@Repository
@RequiredArgsConstructor
public class MetricSeriesRepositoryImpl implements MetricSeriesRepository {
    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqRecordHelper jooqRecordHelper;

    @Override
    public Flux<MetricSeriesPojo> createOrUpdateMetricSeries(final List<MetricSeriesPojo> seriesPojos) {
        final List<MetricSeriesRecord> records = seriesPojos.stream()
            .map(pojo -> jooqReactiveOperations.newRecord(METRIC_SERIES, pojo))
            .toList();
        return jooqReactiveOperations.executeInPartitionReturning(records, rs -> {
            InsertSetStep<MetricSeriesRecord> insertStep = DSL.insertInto(METRIC_SERIES);

            for (int i = 0; i < rs.size() - 1; i++) {
                insertStep = insertStep.set(rs.get(i)).newRecord();
            }

            return jooqReactiveOperations.flux(insertStep.set(rs.get(rs.size() - 1))
                .onConflictOnConstraint(Keys.METRIC_SERIES_UNIQUE_KEY)
                .doUpdate()
                .set(METRIC_SERIES.VALUE_TYPE, excluded(METRIC_SERIES.VALUE_TYPE))
                .returning(METRIC_SERIES.fields()));
        }).map(r -> r.into(MetricSeriesPojo.class));
    }

    @Override
    public Flux<MetricSeriesDto> getSeriesAndPointsByEntityOddrn(final String oddrn) {
        final var query = DSL.select(METRIC_SERIES.fields())
            .select(jsonArrayAgg(DSL.field(METRIC_POINT.asterisk().toString())).as("points"))
            .from(METRIC_SERIES)
            .join(METRIC_ENTITY).on(METRIC_SERIES.METRIC_ENTITY_ID.eq(METRIC_ENTITY.ID))
            .join(METRIC_POINT).on(METRIC_SERIES.ID.eq(METRIC_POINT.SERIES_ID))
            .where(METRIC_ENTITY.ENTITY_ODDRN.eq(oddrn))
            .groupBy(METRIC_SERIES.fields());
        return jooqReactiveOperations.flux(query)
            .map(this::mapSeriesDto);
    }

    private MetricSeriesDto mapSeriesDto(final Record r) {
        final Set<MetricPointPojo> points = jooqRecordHelper.extractAggRelation(r, "points", MetricPointPojo.class);
        final MetricSeriesPojo seriesPojo = r.into(METRIC_SERIES).into(MetricSeriesPojo.class);
        return new MetricSeriesDto(seriesPojo, new ArrayList<>(points));
    }
}
