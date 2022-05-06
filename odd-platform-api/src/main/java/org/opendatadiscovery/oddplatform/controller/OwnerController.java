package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.OwnerApi;
import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerList;
import org.opendatadiscovery.oddplatform.service.OwnerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class OwnerController implements OwnerApi {

    private final OwnerService ownerService;

    @Override
    public Mono<ResponseEntity<Owner>> createOwner(final Mono<OwnerFormData> ownerFormData,
                                                   final ServerWebExchange exchange) {
        return ownerFormData
            .flatMap(ownerService::create)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<OwnerList>> getOwnerList(final Integer page,
                                                        final Integer size,
                                                        final String query,
                                                        final ServerWebExchange exchange) {
        return ownerService.list(page, size, query)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteOwner(final Long ownerId,
                                                  final ServerWebExchange exchange) {
        return ownerService.delete(ownerId)
            .thenReturn(ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<Owner>> updateOwner(final Long ownerId,
                                                   final Mono<OwnerFormData> ownerFormData,
                                                   final ServerWebExchange exchange) {
        return ownerFormData
            .flatMap(form -> ownerService.update(ownerId, form))
            .map(ResponseEntity::ok);
    }
}
