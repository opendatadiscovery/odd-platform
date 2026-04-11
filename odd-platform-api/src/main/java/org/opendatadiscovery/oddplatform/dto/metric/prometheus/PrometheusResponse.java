package org.opendatadiscovery.oddplatform.dto.metric.prometheus;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PrometheusResponse {
    private String status;
    private PrometheusData data;
    private String errorType;
    private String error;
}
