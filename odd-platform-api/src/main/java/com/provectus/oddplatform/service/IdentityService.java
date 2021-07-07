package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.AssociatedOwner;
import com.provectus.oddplatform.api.contract.model.OwnerFormData;
import reactor.core.publisher.Mono;

public interface IdentityService {
    Mono<AssociatedOwner> whoami();

    Mono<AssociatedOwner> associateOwner(final OwnerFormData formData);
}
