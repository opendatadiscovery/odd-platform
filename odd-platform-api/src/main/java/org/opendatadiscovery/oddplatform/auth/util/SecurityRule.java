package org.opendatadiscovery.oddplatform.auth.util;

import org.opendatadiscovery.oddplatform.auth.manager.AuthorizationManagerType;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher;

public record SecurityRule(AuthorizationManagerType type, ServerWebExchangeMatcher matcher,
                           PolicyPermissionDto permission) {
}
