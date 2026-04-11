package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.dto.SLA;
import org.springframework.core.io.Resource;

public interface SLAResourceResolver {
    Resource resolve(final SLA sla);
}
