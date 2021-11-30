package org.opendatadiscovery.oddplatform.controller;

import org.opendatadiscovery.oddplatform.api.contract.api.RoleApi;
import org.opendatadiscovery.oddplatform.api.contract.model.Role;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleList;
import org.opendatadiscovery.oddplatform.api.contract.model.RoleUpdateFormData;
import org.opendatadiscovery.oddplatform.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
public class RoleController
    extends AbstractCRUDController<Role, RoleList, RoleFormData, RoleUpdateFormData, RoleService>
    implements RoleApi {

    public RoleController(final RoleService entityService) {
        super(entityService);
    }

    @Override
    public Mono<ResponseEntity<Role>> createRole(final Mono<RoleFormData> roleFormData,
                                                 final ServerWebExchange exchange) {
        return create(roleFormData);
    }

    @Override
    public Mono<ResponseEntity<Role>> getRoleDetails(final Long roleId, final ServerWebExchange exchange) {
        return get(roleId);
    }

    @Override
    public Mono<ResponseEntity<RoleList>> getRoleList(final Integer page,
                                                      final Integer size,
                                                      final String query,
                                                      final ServerWebExchange exchange) {
        return list(page, size, query);
    }

    @Override
    public Mono<ResponseEntity<Role>> updateRole(final Long roleId,
                                                 final Mono<RoleUpdateFormData> roleUpdateFormData,
                                                 final ServerWebExchange exchange) {
        return update(roleId, roleUpdateFormData);
    }
}
