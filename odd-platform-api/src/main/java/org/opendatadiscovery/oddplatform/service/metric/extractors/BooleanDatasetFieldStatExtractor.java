package org.opendatadiscovery.oddplatform.service.metric.extractors;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.sdk.metrics.data.PointData;
import java.util.stream.Stream;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.BooleanFieldStat;
import org.opendatadiscovery.oddplatform.service.metric.dto.MetricDataTriplet;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

@Component
public class BooleanDatasetFieldStatExtractor extends DatasetFieldStatExtractor<BooleanFieldStat> {
    @Override
    protected Stream<Pair<MetricDataTriplet, ? extends PointData>> extract(final Attributes attributes,
                                                                           final BooleanFieldStat stats) {
        return Stream.of(
            Pair.of(MetricDataTriplet.DF_NULLS_COUNT, ExtractorUtils.longPointData(stats.getNullsCount(), attributes)),
            Pair.of(MetricDataTriplet.DF_TRUE_COUNT, ExtractorUtils.longPointData(stats.getTrueCount(), attributes)),
            Pair.of(MetricDataTriplet.DF_FALSE_COUNT, ExtractorUtils.longPointData(stats.getFalseCount(), attributes))
        );
    }
}
