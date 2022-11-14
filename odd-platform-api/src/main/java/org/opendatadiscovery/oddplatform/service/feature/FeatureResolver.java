package org.opendatadiscovery.oddplatform.service.feature;

import org.opendatadiscovery.oddplatform.api.contract.model.FeatureList;

public interface FeatureResolver {
    String DATA_COLLABORATION_ENABLED_PROPERTY = "datacollaboration.enabled";
    String DATA_COLLABORATION_ENABLED_PROPERTY_SPEL = "${datacollaboration.enabled}";

    String NOTIFICATIONS_ENABLED_PROPERTY = "notifications.enabled";
    String NOTIFICATIONS_ENABLED_PROPERTY_SPEL = "${notifications.enabled}";

    FeatureList resolveActiveFeatures();
}
