package org.opendatadiscovery.oddplatform.auth.manager;

import org.opendatadiscovery.oddplatform.service.permission.PermissionService;
import org.springframework.security.authorization.ReactiveAuthorizationManager;
import org.springframework.security.web.server.authorization.AuthorizationContext;

import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.NAMESPACE_CREATE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.NAMESPACE_DELETE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto.NAMESPACE_UPDATE;

public final class ReactiveAuthorizationManagerFactory {
    private ReactiveAuthorizationManagerFactory() {
    }

    public static ReactiveAuthorizationManager<AuthorizationContext> namespaceCreate(final PermissionService s) {
        return new ReactiveNonContextPermissionAuthorizationManager(s, NAMESPACE_CREATE);
    }

    public static ReactiveAuthorizationManager<AuthorizationContext> namespaceUpdate(final PermissionService s) {
        return new ReactiveNonContextPermissionAuthorizationManager(s, NAMESPACE_UPDATE);
    }

    public static ReactiveAuthorizationManager<AuthorizationContext> namespaceDelete(final PermissionService s) {
        return new ReactiveNonContextPermissionAuthorizationManager(s, NAMESPACE_DELETE);
    }
}
