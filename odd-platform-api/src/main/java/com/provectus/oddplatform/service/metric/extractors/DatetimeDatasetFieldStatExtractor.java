package com.provectus.oddplatform.service.metric.extractors;

import com.provectus.oddplatform.ingestion.contract.model.DateTimeFieldStat;
import com.provectus.oddplatform.service.metric.dto.MetricDataTriplet;
import com.provectus.oddplatform.utils.Pair;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.sdk.metrics.data.PointData;
import java.time.OffsetDateTime;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.jetbrains.annotations.Nullable;
import org.springframework.stereotype.Component;

import static com.provectus.oddplatform.service.metric.extractors.ExtractorUtils.longPointData;

@Component
public class DatetimeDatasetFieldStatExtractor extends DatasetFieldStatExtractor<DateTimeFieldStat> {
    @Override
    protected Stream<Pair<MetricDataTriplet, ? extends PointData>> extract(final Attributes attributes,
                                                                           final DateTimeFieldStat stats) {
        return Stream.of(
            Pair.of(MetricDataTriplet.DF_NULLS_COUNT, longPointData(stats.getNullsCount(), attributes)),
            Pair.of(MetricDataTriplet.DF_UNIQUE_COUNT, longPointData(stats.getUniqueCount(), attributes)),
            Pair.of(MetricDataTriplet.DF_LOWEST_VALUE, longPointData(toEpoch(stats.getLowValue()), attributes)),
            Pair.of(MetricDataTriplet.DF_HIGHEST_VALUE, longPointData(toEpoch(stats.getHighValue()), attributes)),
            Pair.of(MetricDataTriplet.DF_MEDIAN_VALUE, longPointData(toEpoch(stats.getMedianValue()), attributes)),
            Pair.of(MetricDataTriplet.DF_MEAN_VALUE, longPointData(toEpoch(stats.getMeanValue()), attributes))
        );
    }

    @Nullable
    private Long toEpoch(final OffsetDateTime offsetDateTime) {
        if (offsetDateTime == null) {
            return null;
        }

        return offsetDateTime.toEpochSecond();
    }
}
