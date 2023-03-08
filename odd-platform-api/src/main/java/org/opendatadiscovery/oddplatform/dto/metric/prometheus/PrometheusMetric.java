package org.opendatadiscovery.oddplatform.dto.metric.prometheus;

import java.util.List;
import java.util.Map;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PrometheusMetric {
    private Map<String, String> metric;
    private List<Object> value;
}