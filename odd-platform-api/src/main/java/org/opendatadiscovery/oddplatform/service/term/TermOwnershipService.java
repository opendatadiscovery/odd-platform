package org.opendatadiscovery.oddplatform.service.term;

import org.opendatadiscovery.oddplatform.api.contract.model.Ownership;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipUpdateFormData;
import reactor.core.publisher.Mono;

public interface TermOwnershipService {

    Mono<Ownership> create(final long termId, final OwnershipFormData formData);

    Mono<Void> delete(final long termOwnershipId);

    Mono<Ownership> update(final long termOwnershipId, final OwnershipUpdateFormData formData);
}
