package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Ownership;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipUpdateFormData;
import reactor.core.publisher.Mono;

public interface OwnershipService {
    Mono<Ownership> create(final long dataEntityId, final OwnershipFormData formData);

    Mono<Void> delete(final long ownershipId, final Boolean propagate);

    Mono<Ownership> update(final long ownershipId, final OwnershipUpdateFormData formData);
}
