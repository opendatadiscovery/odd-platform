package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.OwnerAssociationRequestApi;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestList;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatusFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.service.OwnerAssociationRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class OwnerAssociationRequestController implements OwnerAssociationRequestApi {
    private final OwnerAssociationRequestService ownerAssociationRequestService;

    @Override
    public Mono<ResponseEntity<OwnerAssociationRequest>> createOwnerAssociationRequest(
        final Mono<OwnerFormData> formData,
        final ServerWebExchange exchange) {
        return formData
            .flatMap(fd -> ownerAssociationRequestService.createOwnerAssociationRequest(fd.getName()))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<OwnerAssociationRequestList>> getOwnerAssociationRequestList(final Integer page,
                                                                                            final Integer size,
                                                                                            final Boolean active,
                                                                                            final String query,
                                                                                            final ServerWebExchange e) {
        return ownerAssociationRequestService.getOwnerAssociationRequestList(page, size, query, active)
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
}
