package org.opendatadiscovery.oddplatform.dto.metric;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum MetricSeriesValueType {
    VALUE(1, ""),
    COUNT(2, "_count"),
    SUM(3, "_sum"),
    CREATED(4, "_created"),
    BUCKET(5, "_bucket"),
    QUANTILE(6, "_quantile");

    private final int code;
    private final String suffix;
}