package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import reactor.core.publisher.Mono;

public interface IdentityService {
    Mono<AssociatedOwner> whoami();
}
