package org.opendatadiscovery.oddplatform.auth.manager.extractor;

import org.opendatadiscovery.oddplatform.auth.manager.AuthorizationManagerType;
import org.springframework.security.web.server.authorization.AuthorizationContext;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class URLResourceExtractor implements ResourceExtractor {

    @Override
    public boolean handles(final AuthorizationManagerType type) {
        return type == AuthorizationManagerType.DATA_ENTITY || type == AuthorizationManagerType.TERM
            || type == AuthorizationManagerType.DEG;
    }

    @Override
    public Mono<Long> extractResourceId(final AuthorizationContext context,
                                        final String resourceIdVariableName) {
        return Mono.just((String) context.getVariables().get(resourceIdVariableName))
            .map(Long::valueOf);
    }
}
