package org.opendatadiscovery.oddplatform.dto.metric;

import org.opendatadiscovery.oddplatform.model.tables.pojos.ExternalMetricLastValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;

public record ExternalMetricLastValueDto(ExternalMetricLastValuePojo pojo,
                                         MetricFamilyPojo familyPojo) {
}
