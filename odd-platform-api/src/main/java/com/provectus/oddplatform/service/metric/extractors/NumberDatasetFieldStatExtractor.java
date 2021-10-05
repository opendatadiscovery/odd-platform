package com.provectus.oddplatform.service.metric.extractors;

import com.provectus.oddplatform.ingestion.contract.model.NumberFieldStat;
import com.provectus.oddplatform.service.metric.dto.MetricDataTriplet;
import com.provectus.oddplatform.utils.Pair;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.sdk.metrics.data.PointData;
import java.util.stream.Stream;
import org.springframework.stereotype.Component;

import static com.provectus.oddplatform.service.metric.extractors.ExtractorUtils.longPointData;

@Component
public class NumberDatasetFieldStatExtractor extends DatasetFieldStatExtractor<NumberFieldStat> {
    @Override
    protected Stream<Pair<MetricDataTriplet, ? extends PointData>> extract(final Attributes attributes,
                                                                           final NumberFieldStat stats) {
        // TODO: add BigDecimal metrics
        return Stream.of(
            Pair.of(MetricDataTriplet.DF_NULLS_COUNT, longPointData(stats.getNullsCount(), attributes)),
            Pair.of(MetricDataTriplet.DF_UNIQUE_COUNT, longPointData(stats.getUniqueCount(), attributes))
        );
    }
}
