package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import reactor.core.publisher.Mono;

public interface IdentityService {
    Mono<AssociatedOwner> whoami();

    Mono<AssociatedOwner> associateOwner(final OwnerFormData formData);
}
