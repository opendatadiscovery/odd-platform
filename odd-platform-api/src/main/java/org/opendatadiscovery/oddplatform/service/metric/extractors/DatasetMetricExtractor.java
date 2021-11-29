package org.opendatadiscovery.oddplatform.service.metric.extractors;

import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.sdk.metrics.data.LongPointData;
import io.opentelemetry.sdk.metrics.data.MetricData;
import io.opentelemetry.sdk.metrics.data.PointData;
import java.util.stream.Stream;
import org.opendatadiscovery.oddplatform.dto.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityType;
import org.opendatadiscovery.oddplatform.dto.IngestionDataStructure;
import org.opendatadiscovery.oddplatform.service.metric.dto.MetricDataTriplet;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.service.metric.extractors.ExtractorUtils.longPointData;

@Component
public class DatasetMetricExtractor implements MetricExtractor {
    @Override
    public Stream<MetricData> extract(final IngestionDataStructure dataStructure) {
        final Stream<Pair<MetricDataTriplet, ? extends PointData>> metricStream = dataStructure.getAllEntities()
            .stream()
            .filter(de -> de.getTypes().contains(DataEntityType.DATA_SET))
            .map(this::buildMetrics);

        return gaugeStream(metricStream);
    }

    private Pair<MetricDataTriplet, LongPointData> buildMetrics(final DataEntityIngestionDto entity) {
        final Attributes attributes = Attributes.of(AttributeKey.stringKey("entity_oddrn"), entity.getOddrn());

        return Pair.of(
            MetricDataTriplet.ROWS_COUNT,
            longPointData(entity.getDataSet().getRowsCount(), attributes)
        );
    }
}
