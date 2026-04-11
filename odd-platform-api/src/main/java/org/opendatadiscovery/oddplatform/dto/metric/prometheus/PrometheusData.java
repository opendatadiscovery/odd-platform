package org.opendatadiscovery.oddplatform.dto.metric.prometheus;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PrometheusData {
    private String resultType;
    private List<PrometheusMetric> result;
}
