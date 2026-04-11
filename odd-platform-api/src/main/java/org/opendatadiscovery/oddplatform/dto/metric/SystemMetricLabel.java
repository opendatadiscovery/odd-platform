package org.opendatadiscovery.oddplatform.dto.metric;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum SystemMetricLabel {
    BUCKET_UPPER_BOUND("le"),
    QUANTILE("quantile"),
    NAME("__name__"),
    ODDRN("oddrn"),
    TENANT_ID("tenant_id"),
    METRIC_FAMILY_ID("metric_family_id");

    private final String labelName;

    public static Set<String> getSystemMetricLabelNames() {
        return Arrays.stream(SystemMetricLabel.values())
            .map(SystemMetricLabel::getLabelName)
            .collect(Collectors.toSet());
    }
}
