package org.opendatadiscovery.oddplatform.dto.ingestion;

import java.util.List;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Label;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricFamily;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricPoint;

public record IngestionMetricPointDto(String oddrn,
                                      MetricFamily metricFamily,
                                      List<Label> labels,
                                      MetricPoint metricPoint) {
}
