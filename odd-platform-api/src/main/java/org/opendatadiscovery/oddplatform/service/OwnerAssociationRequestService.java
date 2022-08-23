package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestList;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import reactor.core.publisher.Mono;

public interface OwnerAssociationRequestService {
    Mono<OwnerAssociationRequest> createOwnerAssociationRequest(final String ownerName);

    Mono<OwnerAssociationRequestList> getOwnerAssociationRequestList(final int page,
                                                                     final int size,
                                                                     final String query,
                                                                     final Boolean active);

    Mono<OwnerAssociationRequest> updateOwnerAssociationRequest(final long id,
                                                                final OwnerAssociationRequestStatus status);
}
