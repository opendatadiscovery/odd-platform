package org.opendatadiscovery.oddplatform.auth.manager.extractor;

import org.opendatadiscovery.oddplatform.auth.manager.AuthorizationManagerType;
import org.springframework.security.web.server.authorization.AuthorizationContext;
import reactor.core.publisher.Mono;

public interface ResourceExtractor {
    boolean handles(final AuthorizationManagerType type);

    Mono<Long> extractResourceId(final AuthorizationContext context,
                                 final String resourceIdVariableName);
}
