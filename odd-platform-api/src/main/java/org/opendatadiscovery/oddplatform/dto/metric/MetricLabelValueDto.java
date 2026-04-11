package org.opendatadiscovery.oddplatform.dto.metric;

import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelValuePojo;

public record MetricLabelValueDto(MetricLabelValuePojo labelValue, MetricLabelPojo label) {
}
