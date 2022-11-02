package org.opendatadiscovery.oddplatform.controller;

import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.api.contract.api.IdentityApi;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.Identity;
import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import org.opendatadiscovery.oddplatform.service.IdentityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Slf4j
public class IdentityController implements IdentityApi {
    private final IdentityService identityService;

    @Override
    public Mono<ResponseEntity<AssociatedOwner>> whoami(final ServerWebExchange exchange) {
        return identityService.whoami()
            .map(ResponseEntity::ok)
            .switchIfEmpty(Mono.just(new ResponseEntity<>(dummyOwner(), HttpStatus.OK)));
    }

    private AssociatedOwner dummyOwner() {
        return new AssociatedOwner().identity(
            new Identity().username("admin").permissions((Arrays.asList(Permission.values()))));
    }
}
