package org.opendatadiscovery.oddplatform.service.metric.extractors;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.sdk.metrics.data.DoublePointData;
import io.opentelemetry.sdk.metrics.data.LongPointData;
import org.jetbrains.annotations.Nullable;

public class ExtractorUtils {
    @Nullable
    public static LongPointData longPointData(final Number value, final Attributes attributes) {
        if (value == null) {
            return null;
        }

        final long now = nanoTime(System.currentTimeMillis());

        return LongPointData.create(now, now, attributes, value.longValue());
    }

    @Nullable
    public static DoublePointData doublePointData(final Number value, final Attributes attributes) {
        if (value == null) {
            return null;
        }

        final long now = nanoTime(System.currentTimeMillis());

        return DoublePointData.create(now, now, attributes, value.doubleValue());
    }

    private static long nanoTime(final long now) {
        return now * 1_000_000;
    }
}
