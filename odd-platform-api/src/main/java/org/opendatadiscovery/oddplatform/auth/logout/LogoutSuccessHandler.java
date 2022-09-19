package org.opendatadiscovery.oddplatform.auth.logout;

import org.opendatadiscovery.oddplatform.auth.ODDOAuth2Properties;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import reactor.core.publisher.Mono;

public interface LogoutSuccessHandler {
    boolean shouldHandle(final String provider);

    Mono<Void> handle(final WebFilterExchange exchange,
                      final Authentication authentication,
                      final ODDOAuth2Properties.OAuth2Provider provider);
}
