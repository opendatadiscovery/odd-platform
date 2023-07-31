package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DataEntityStaleDetector {
    @Value("${odd.data-entity-stale-period}")
    private Integer stalePeriod;

    public boolean isDataEntityStale(final DataEntityPojo pojo) {
        return pojo.getLastIngestedAt() != null
            && DateTimeUtil.generateNow().isAfter(pojo.getLastIngestedAt().plusDays(stalePeriod));
    }
}
