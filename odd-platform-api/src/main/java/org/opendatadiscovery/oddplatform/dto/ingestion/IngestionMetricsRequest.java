package org.opendatadiscovery.oddplatform.dto.ingestion;

import java.util.List;
import java.util.Map;
import java.util.Set;
import org.apache.commons.collections4.SetValuedMap;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;

public record IngestionMetricsRequest(
    Set<String> metricRelatedOddrns,
    Map<String, MetricFamilyPojo> metricFamilies,
    SetValuedMap<String, String> labels,
    List<IngestionMetricPointDto> points) {
}
