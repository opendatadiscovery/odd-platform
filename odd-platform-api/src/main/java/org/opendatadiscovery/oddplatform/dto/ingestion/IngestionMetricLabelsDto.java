package org.opendatadiscovery.oddplatform.dto.ingestion;

import java.util.Map;
import org.apache.commons.collections4.SetValuedMap;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelValuePojo;

public record IngestionMetricLabelsDto(Map<String, MetricLabelPojo> labelsNamesMap,
                                       SetValuedMap<String, MetricLabelValuePojo> labelValuesMap) {
}
