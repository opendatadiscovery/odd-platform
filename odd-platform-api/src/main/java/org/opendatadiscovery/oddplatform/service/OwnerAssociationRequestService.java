package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestList;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatusParam;
import org.opendatadiscovery.oddplatform.api.contract.model.ProviderList;
import org.opendatadiscovery.oddplatform.api.contract.model.UserOwnerMappingFormData;
import reactor.core.publisher.Mono;

public interface OwnerAssociationRequestService {
    Mono<OwnerAssociationRequest> createOwnerAssociationRequest(final String ownerName);

    Mono<OwnerAssociationRequestList> getOwnerAssociationRequestList(final int page,
                                                                     final int size,
                                                                     final String query,
                                                                     final OwnerAssociationRequestStatusParam status);

    Mono<OwnerAssociationRequest> updateOwnerAssociationRequest(final long id,
                                                                final OwnerAssociationRequestStatus status);

    Mono<Owner> createUserOwnerMapping(final UserOwnerMappingFormData form);

    Mono<Owner> deleteActiveUserOwnerMapping(final Long ownerId);

    Mono<ProviderList> getAuthProviders();
}
