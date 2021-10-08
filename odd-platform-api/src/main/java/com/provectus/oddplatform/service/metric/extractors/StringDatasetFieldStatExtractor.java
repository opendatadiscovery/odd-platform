package com.provectus.oddplatform.service.metric.extractors;

import com.provectus.oddplatform.ingestion.contract.model.StringFieldStat;
import com.provectus.oddplatform.service.metric.dto.MetricDataTriplet;
import com.provectus.oddplatform.utils.Pair;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.sdk.metrics.data.PointData;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.stereotype.Component;

import static com.provectus.oddplatform.service.metric.extractors.ExtractorUtils.doublePointData;
import static com.provectus.oddplatform.service.metric.extractors.ExtractorUtils.longPointData;

@Component
public class StringDatasetFieldStatExtractor extends DatasetFieldStatExtractor<StringFieldStat> {
    @Override
    protected Stream<Pair<MetricDataTriplet, ? extends PointData>> extract(final Attributes attributes,
                                                                           final StringFieldStat stats) {
        return Stream.of(
            Pair.of(MetricDataTriplet.DF_NULLS_COUNT, longPointData(stats.getNullsCount(), attributes)),
            Pair.of(MetricDataTriplet.DF_UNIQUE_COUNT, longPointData(stats.getUniqueCount(), attributes)),
            Pair.of(MetricDataTriplet.DF_MAX_LENGTH, longPointData(stats.getMaxLength(), attributes)),
            Pair.of(MetricDataTriplet.DF_AVG_LENGTH, doublePointData(stats.getAvgLength(), attributes))
        );
    }
}
