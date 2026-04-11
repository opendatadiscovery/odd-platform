package org.opendatadiscovery.oddplatform.service.ingestion.alert;

import java.util.Map;
import org.apache.commons.collections4.SetValuedMap;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertHaltConfigPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.springframework.stereotype.Component;

@Component
public class AlertActionResolverFactory {
    public AlertActionResolver create(final Map<String, SetValuedMap<Short, AlertPojo>> openAlerts,
                                      final Map<String, AlertHaltConfigPojo> haltConfigs) {
        return new AlertActionResolverImpl(openAlerts, haltConfigs);
    }
}
