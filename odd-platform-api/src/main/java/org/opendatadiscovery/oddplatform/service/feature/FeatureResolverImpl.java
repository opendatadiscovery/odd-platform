package org.opendatadiscovery.oddplatform.service.feature;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import org.apache.commons.lang3.BooleanUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.Feature;
import org.opendatadiscovery.oddplatform.api.contract.model.FeatureList;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class FeatureResolverImpl implements FeatureResolver {
    private final Set<Feature> activeFeatures;

    public FeatureResolverImpl(
        @Value(DATA_COLLABORATION_ENABLED_PROPERTY_SPEL) final Boolean dataCollaborationActive,
        @Value(NOTIFICATIONS_ENABLED_PROPERTY_SPEL) final Boolean notificationsFeatureActive
    ) {
        final Set<Feature> activeFeatures = new HashSet<>();

        if (BooleanUtils.isTrue(dataCollaborationActive)) {
            activeFeatures.add(Feature.DATA_COLLABORATION);
        }

        if (BooleanUtils.isTrue(notificationsFeatureActive)) {
            activeFeatures.add(Feature.ALERT_NOTIFICATIONS);
        }

        this.activeFeatures = activeFeatures;
    }

    @Override
    public FeatureList resolveActiveFeatures() {
        return new FeatureList().items(new ArrayList<>(activeFeatures));
    }
}
