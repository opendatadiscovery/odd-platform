package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricFamily;
import org.opendatadiscovery.oddplatform.dto.metric.prometheus.PrometheusResponse;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;

public interface PrometheusMetricsMapper {
    List<MetricFamily> mapFromPrometheus(final List<PrometheusResponse> responses,
                                         final Map<Integer, MetricFamilyPojo> families);
}