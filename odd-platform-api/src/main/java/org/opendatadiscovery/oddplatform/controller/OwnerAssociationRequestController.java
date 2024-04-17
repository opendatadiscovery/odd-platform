package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.OwnerAssociationRequestApi;
import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestActivityList;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestList;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatusFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatusParam;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.ProviderList;
import org.opendatadiscovery.oddplatform.api.contract.model.UserOwnerMappingFormData;
import org.opendatadiscovery.oddplatform.service.OwnerAssociationRequestActivityService;
import org.opendatadiscovery.oddplatform.service.OwnerAssociationRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class OwnerAssociationRequestController implements OwnerAssociationRequestApi {
    private final OwnerAssociationRequestService ownerAssociationRequestService;
    private final OwnerAssociationRequestActivityService activityService;

    @Override
    public Mono<ResponseEntity<OwnerAssociationRequest>> createOwnerAssociationRequest(
        final Mono<OwnerFormData> formData,
        final ServerWebExchange exchange) {
        return formData
            .flatMap(fd -> ownerAssociationRequestService.createOwnerAssociationRequest(fd.getName()))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<OwnerAssociationRequestList>>
        getOwnerAssociationRequestList(final Integer page,
                                       final Integer size,
                                       final OwnerAssociationRequestStatusParam status,
                                       final String query,
                                       final ServerWebExchange e) {
        return ownerAssociationRequestService.getOwnerAssociationRequestList(page, size, query, status)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<OwnerAssociationRequestActivityList>> getOwnerAssociationRequestActivityList(
        final Integer page, final Integer size, final OwnerAssociationRequestStatusParam status, final String query,
        final ServerWebExchange exchange) {
        return activityService.getOwnerAssociationRequestList(page, size, query, status)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<OwnerAssociationRequest>> updateOwnerAssociationRequest(
        final Long id,
        final Mono<OwnerAssociationRequestStatusFormData> formData,
        final ServerWebExchange exchange) {
        return formData
            .flatMap(fd -> ownerAssociationRequestService.updateOwnerAssociationRequest(id, fd.getStatus()))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Owner>>
        createUserOwnerMapping(final Mono<UserOwnerMappingFormData> userOwnerMappingFormData,
                           final ServerWebExchange exchange) {
        return userOwnerMappingFormData
            .flatMap(ownerAssociationRequestService::createUserOwnerMapping)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteActiveUserOwnerMapping(final Long ownerId,
                                                                   final ServerWebExchange exchange) {
        return ownerAssociationRequestService.deleteActiveUserOwnerMapping(ownerId)
            .thenReturn(ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<ProviderList>> getAuthProviders(final ServerWebExchange exchange) {
        return ownerAssociationRequestService.getAuthProviders()
            .map(ResponseEntity::ok);
    }
}
