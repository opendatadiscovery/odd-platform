package org.opendatadiscovery.oddplatform.auth.authorization;

import java.util.HashMap;
import java.util.Map;
import org.opendatadiscovery.oddplatform.auth.util.SecurityConstants;
import org.opendatadiscovery.oddplatform.service.permission.PermissionService;
import org.springframework.security.authorization.ReactiveAuthorizationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.authorization.AuthorizationContext;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher;

import static org.opendatadiscovery.oddplatform.auth.manager.ReactiveAuthorizationManagerFactory.namespaceCreate;
import static org.opendatadiscovery.oddplatform.auth.manager.ReactiveAuthorizationManagerFactory.namespaceDelete;
import static org.opendatadiscovery.oddplatform.auth.manager.ReactiveAuthorizationManagerFactory.namespaceUpdate;

public class AuthorizationCustomizer implements Customizer<ServerHttpSecurity.AuthorizeExchangeSpec> {
    private final PermissionService permissionService;
    private final Map<ServerWebExchangeMatcher, ReactiveAuthorizationManager<AuthorizationContext>> AUTH_MAP =
        new HashMap<>();

    public AuthorizationCustomizer(final PermissionService permissionService) {
        this.permissionService = permissionService;
        initAuthMap();
    }

    @Override
    public void customize(final ServerHttpSecurity.AuthorizeExchangeSpec authorizeExchangeSpec) {
        ServerHttpSecurity.AuthorizeExchangeSpec spec = authorizeExchangeSpec
            .pathMatchers(SecurityConstants.WHITELIST_PATHS)
            .permitAll();
        for (final var entry : AUTH_MAP.entrySet()) {
            spec = spec.matchers(entry.getKey()).access(entry.getValue());
        }
        spec.pathMatchers("/**")
            .authenticated();
    }

    private void initAuthMap() {
        this.AUTH_MAP.putAll(Map.ofEntries(
            Map.entry(SecurityConstants.NAMESPACE_CREATE, namespaceCreate(permissionService)),
            Map.entry(SecurityConstants.NAMESPACE_UPDATE, namespaceUpdate(permissionService)),
            Map.entry(SecurityConstants.NAMESPACE_DELETE, namespaceDelete(permissionService))
        ));
    }
}
