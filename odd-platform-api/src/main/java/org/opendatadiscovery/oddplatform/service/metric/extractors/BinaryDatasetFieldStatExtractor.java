package org.opendatadiscovery.oddplatform.service.metric.extractors;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.sdk.metrics.data.PointData;
import java.util.stream.Stream;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.BinaryFieldStat;
import org.opendatadiscovery.oddplatform.service.metric.dto.MetricDataTriplet;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.service.metric.extractors.ExtractorUtils.doublePointData;
import static org.opendatadiscovery.oddplatform.service.metric.extractors.ExtractorUtils.longPointData;

@Component
public class BinaryDatasetFieldStatExtractor extends DatasetFieldStatExtractor<BinaryFieldStat> {
    @Override
    protected Stream<Pair<MetricDataTriplet, ? extends PointData>> extract(final Attributes attributes,
                                                                           final BinaryFieldStat stats) {
        return Stream.of(
            Pair.of(MetricDataTriplet.DF_NULLS_COUNT, longPointData(stats.getNullsCount(), attributes)),
            Pair.of(MetricDataTriplet.DF_UNIQUE_COUNT, longPointData(stats.getUniqueCount(), attributes)),
            Pair.of(MetricDataTriplet.DF_MAX_LENGTH, longPointData(stats.getMaxLength(), attributes)),
            Pair.of(MetricDataTriplet.DF_AVG_LENGTH, doublePointData(stats.getAvgLength(), attributes))
        );
    }
}
