package org.opendatadiscovery.oddplatform.auth.logout;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@ConditionalOnProperty(value = "auth.type", havingValue = "OAUTH2")
@RequiredArgsConstructor
public class OAuthLogoutSuccessHandler implements ServerLogoutSuccessHandler {
    private final List<LogoutSuccessHandler> logoutSuccessHandlers;

    @Override
    public Mono<Void> onLogoutSuccess(final WebFilterExchange exchange,
                                      final Authentication authentication) {
        final OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        final String providerId = oauthToken.getAuthorizedClientRegistrationId();
        return getLogoutHandler(providerId)
            .map(handler -> handler.handle(exchange, authentication))
            .orElse(Mono.empty());
    }

    private Optional<LogoutSuccessHandler> getLogoutHandler(final String providerId) {
        return logoutSuccessHandlers.stream()
            .filter(h -> h.getProviderId().equalsIgnoreCase(providerId))
            .findFirst();
    }
}
