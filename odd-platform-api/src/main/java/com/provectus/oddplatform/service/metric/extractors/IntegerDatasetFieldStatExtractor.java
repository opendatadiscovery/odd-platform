package com.provectus.oddplatform.service.metric.extractors;

import com.provectus.oddplatform.ingestion.contract.model.IntegerFieldStat;
import com.provectus.oddplatform.service.metric.dto.MetricDataTriplet;
import com.provectus.oddplatform.utils.Pair;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.sdk.metrics.data.PointData;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.stereotype.Component;

import static com.provectus.oddplatform.service.metric.extractors.ExtractorUtils.longPointData;

@Component
public class IntegerDatasetFieldStatExtractor extends DatasetFieldStatExtractor<IntegerFieldStat> {
    @Override
    protected Stream<Pair<MetricDataTriplet, ? extends PointData>> extract(final Attributes attributes,
                                                                           final IntegerFieldStat stats) {
        return Stream.of(
            Pair.of(MetricDataTriplet.DF_NULLS_COUNT, longPointData(stats.getNullsCount(), attributes)),
            Pair.of(MetricDataTriplet.DF_UNIQUE_COUNT, longPointData(stats.getUniqueCount(), attributes)),
            Pair.of(MetricDataTriplet.DF_LOWEST_VALUE, longPointData(stats.getLowValue(), attributes)),
            Pair.of(MetricDataTriplet.DF_HIGHEST_VALUE, longPointData(stats.getHighValue(), attributes)),
            Pair.of(MetricDataTriplet.DF_MEDIAN_VALUE, longPointData(stats.getMedianValue(), attributes)),
            Pair.of(MetricDataTriplet.DF_MEAN_VALUE, longPointData(stats.getMeanValue(), attributes))
        );
    }
}
