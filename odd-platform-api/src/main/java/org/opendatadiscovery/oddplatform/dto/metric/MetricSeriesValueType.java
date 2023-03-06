package org.opendatadiscovery.oddplatform.dto.metric;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum MetricSeriesValueType {
    VALUE(1),
    COUNT(2),
    SUM(3),
    CREATED(4),
    BUCKET(5),
    QUANTILE(6);

    private final int code;
}
