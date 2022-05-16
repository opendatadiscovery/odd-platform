package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.RoleApi;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleList;
import org.opendatadiscovery.oddplatform.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class RoleController implements RoleApi {

    private final RoleService roleService;

    @Override
    public Mono<ResponseEntity<RoleList>> getRoleList(final Integer page,
                                                      final Integer size,
                                                      final String query,
                                                      final ServerWebExchange exchange) {
        return roleService.list(page, size, query)
            .map(ResponseEntity::ok);
    }
}
