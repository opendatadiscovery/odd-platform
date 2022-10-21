package org.opendatadiscovery.oddplatform.service.feature;

import org.opendatadiscovery.oddplatform.api.contract.model.FeatureList;
import reactor.core.publisher.Mono;

public interface FeatureResolver {
    Mono<FeatureList> resolveActiveFeatures();
}
