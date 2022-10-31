package org.opendatadiscovery.oddplatform.auth.authorization;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.auth.manager.ReactiveAuthorizationManagerFactory;
import org.opendatadiscovery.oddplatform.auth.util.SecurityConstants;
import org.opendatadiscovery.oddplatform.auth.util.SecurityRule;
import org.opendatadiscovery.oddplatform.service.permission.PermissionService;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.web.server.ServerHttpSecurity;

@RequiredArgsConstructor
public class AuthorizationCustomizer implements Customizer<ServerHttpSecurity.AuthorizeExchangeSpec> {
    private final PermissionService permissionService;

    @Override
    public void customize(final ServerHttpSecurity.AuthorizeExchangeSpec authorizeExchangeSpec) {
        ServerHttpSecurity.AuthorizeExchangeSpec spec = authorizeExchangeSpec
            .pathMatchers(SecurityConstants.WHITELIST_PATHS)
            .permitAll();
        for (final SecurityRule rule : SecurityConstants.SECURITY_RULES) {
            spec = spec
                .matchers(rule.matcher())
                .access(ReactiveAuthorizationManagerFactory.manager(rule.type(), permissionService, rule.permission()));
        }
        spec.pathMatchers("/**")
            .authenticated();
    }
}
