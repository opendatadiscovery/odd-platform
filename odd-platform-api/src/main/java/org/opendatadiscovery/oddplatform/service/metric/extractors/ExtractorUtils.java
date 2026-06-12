package org.opendatadiscovery.oddplatform.service.metric.extractors;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.sdk.metrics.data.DoublePointData;
import io.opentelemetry.sdk.metrics.data.LongPointData;
import io.opentelemetry.sdk.metrics.internal.data.ImmutableDoublePointData;
import io.opentelemetry.sdk.metrics.internal.data.ImmutableLongPointData;
import org.jetbrains.annotations.Nullable;

public class ExtractorUtils {
    @Nullable
    public static LongPointData longPointData(final Number value, final Attributes attributes) {
        if (value == null) {
            return null;
        }

        final long now = nanoTime(System.currentTimeMillis());

        return ImmutableLongPointData.create(now, now, attributes, value.longValue());
    }

    @Nullable
    public static DoublePointData doublePointData(final Number value, final Attributes attributes) {
        if (value == null) {
            return null;
        }

        final long now = nanoTime(System.currentTimeMillis());

        return ImmutableDoublePointData.create(now, now, attributes, value.doubleValue());
    }

    private static long nanoTime(final long now) {
        return now * 1_000_000;
    }
}
