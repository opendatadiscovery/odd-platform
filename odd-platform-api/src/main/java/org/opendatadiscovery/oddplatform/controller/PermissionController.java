package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.PermissionApi;
import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import org.opendatadiscovery.oddplatform.api.contract.model.PermissionResourceType;
import org.opendatadiscovery.oddplatform.service.permission.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class PermissionController implements PermissionApi {
    private final PermissionService permissionService;

    @Override
    public Mono<ResponseEntity<Flux<Permission>>> getResourcePermissions(final PermissionResourceType resourceType,
                                                                         final Long resourceId,
                                                                         final ServerWebExchange exchange) {
        return Mono.just(permissionService.getResourcePermissionsForCurrentUser(resourceType, resourceId))
            .map(ResponseEntity::ok);
    }
}
