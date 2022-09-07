package org.opendatadiscovery.oddplatform.auth.logout;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import reactor.core.publisher.Mono;

public interface LogoutSuccessHandler {
    String getProviderId();

    Mono<Void> handle(final WebFilterExchange exchange, final Authentication authentication);
}
