package org.opendatadiscovery.oddplatform.service.feature;

import java.util.List;
import org.apache.commons.lang3.BooleanUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.Feature;
import org.opendatadiscovery.oddplatform.api.contract.model.FeatureList;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class FeatureResolverImpl implements FeatureResolver {
    private final FeatureList featureList;

    // TODO: figure out how to make it better
    public FeatureResolverImpl(@Value("${datacollaboration.enabled}") final Boolean dataCollaborationActive) {
        if (BooleanUtils.isTrue(dataCollaborationActive)) {
            featureList = new FeatureList().items(List.of(Feature.DATA_COLLABORATION_SLACK));
        } else {
            featureList = new FeatureList();
        }
    }

    @Override
    public Mono<FeatureList> resolveActiveFeatures() {
        return Mono.just(featureList);
    }
}
