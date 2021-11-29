package org.opendatadiscovery.oddplatform.controller;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
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
public class OwnerController
    extends AbstractCRUDController<Owner, OwnerList, OwnerFormData, OwnerFormData, OwnerService>
    implements OwnerApi {

    public OwnerController(final OwnerService entityService) {
        super(entityService);
    }

    @Override
    public Mono<ResponseEntity<Owner>> createOwner(
        @Valid final Mono<OwnerFormData> ownerFormData,
        final ServerWebExchange exchange
    ) {
        return create(ownerFormData);
    }

    @Override
    public Mono<ResponseEntity<OwnerList>> getOwnerList(
        @NotNull @Valid final Integer page,
        @NotNull @Valid final Integer size,
        @Valid final String query,
        final ServerWebExchange exchange
    ) {
        return list(page, size, query);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteOwner(final Long ownerId,
                                                  final ServerWebExchange exchange) {
        return delete(ownerId);
    }

    @Override
    public Mono<ResponseEntity<Owner>> updateOwner(final Long ownerId,
                                                   final Mono<OwnerFormData> ownerFormData,
                                                   final ServerWebExchange exchange) {
        return update(ownerId, ownerFormData);
    }
}
