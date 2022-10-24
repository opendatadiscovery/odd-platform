package org.opendatadiscovery.oddplatform.service.feature;

import org.opendatadiscovery.oddplatform.api.contract.model.FeatureList;

public interface FeatureResolver {
    String DATA_COLLABORATION_ENABLED_PROPERTY = "datacollaboration.enabled";
    String DATA_COLLABORATION_ENABLED_PROPERTY_SPEL = "${datacollaboration.enabled}";

    FeatureList resolveActiveFeatures();
}
