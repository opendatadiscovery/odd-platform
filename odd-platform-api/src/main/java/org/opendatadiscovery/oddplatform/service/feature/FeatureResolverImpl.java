package org.opendatadiscovery.oddplatform.service.feature;

import java.util.List;
import java.util.Set;
import org.apache.commons.lang3.BooleanUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.Feature;
import org.opendatadiscovery.oddplatform.api.contract.model.FeatureList;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import static java.util.Collections.emptySet;

@Component
public class FeatureResolverImpl implements FeatureResolver {
    private final FeatureList featureList;
    private final Set<Feature> activeFeatures;

    // TODO: figure out how to make it better
    public FeatureResolverImpl(
        @Value(DATA_COLLABORATION_ENABLED_PROPERTY_SPEL) final Boolean dataCollaborationActive
    ) {
        if (BooleanUtils.isTrue(dataCollaborationActive)) {
            featureList = new FeatureList().items(List.of(Feature.DATA_COLLABORATION));
            activeFeatures = Set.of(Feature.DATA_COLLABORATION);
        } else {
            featureList = new FeatureList();
            activeFeatures = emptySet();
        }
    }

    @Override
    public FeatureList resolveActiveFeatures() {
        return featureList;
    }
}
