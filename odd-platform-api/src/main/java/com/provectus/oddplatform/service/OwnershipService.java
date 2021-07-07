package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.Ownership;
import com.provectus.oddplatform.api.contract.model.OwnershipFormData;
import com.provectus.oddplatform.api.contract.model.OwnershipUpdateFormData;
import reactor.core.publisher.Mono;

public interface OwnershipService {
    Mono<Ownership> create(final long dataEntityId, final OwnershipFormData formData);

    Mono<Void> delete(final long ownershipId);

    Mono<Ownership> update(final long ownershipId, final OwnershipUpdateFormData formData);
}
