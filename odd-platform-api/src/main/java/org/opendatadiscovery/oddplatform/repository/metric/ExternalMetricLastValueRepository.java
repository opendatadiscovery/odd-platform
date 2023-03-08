package org.opendatadiscovery.oddplatform.repository.metric;

import java.util.List;
import org.apache.commons.collections4.SetValuedMap;
import org.opendatadiscovery.oddplatform.dto.metric.ExternalMetricLastValueDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ExternalMetricLastValuePojo;
import reactor.core.publisher.Flux;

public interface ExternalMetricLastValueRepository {
    Flux<ExternalMetricLastValuePojo> createOrUpdateLastValues(final List<ExternalMetricLastValuePojo> pojos);

    Flux<ExternalMetricLastValuePojo> getCurrentLastValues(final SetValuedMap<String, Integer> oddrnFamilies);

    Flux<ExternalMetricLastValueDto> getByOddrn(final String oddrn);
}
