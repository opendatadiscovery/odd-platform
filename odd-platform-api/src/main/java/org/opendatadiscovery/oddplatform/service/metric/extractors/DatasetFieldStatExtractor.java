package org.opendatadiscovery.oddplatform.service.metric.extractors;

import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.sdk.metrics.data.PointData;
import java.util.stream.Stream;
import org.opendatadiscovery.oddplatform.service.metric.dto.MetricDataTriplet;
import org.opendatadiscovery.oddplatform.utils.Pair;

public abstract class DatasetFieldStatExtractor<T> {
    protected abstract Stream<Pair<MetricDataTriplet, ? extends PointData>> extract(final Attributes attributes,
                                                                                    final T stats);

    public Stream<Pair<MetricDataTriplet, ? extends PointData>> extract(final String entityOddrn,
                                                                        final String fieldOddrn,
                                                                        final T stats) {
        if (stats == null) {
            return Stream.empty();
        }

        final Attributes attributes = Attributes.of(
            AttributeKey.stringKey("entity_oddrn"), entityOddrn,
            AttributeKey.stringKey("field_oddrn"), fieldOddrn
        );

        return extract(attributes, stats);
    }
}
