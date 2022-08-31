package org.opendatadiscovery.oddplatform.auth.logout;

import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class OAuthLogoutSuccessHandler implements ServerLogoutSuccessHandler {
    private final Map<String, LogoutSuccessHandler> handlerMap;

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
        final String logoutHandlerBeanId = providerId + "LogoutHandler";
        return Optional.ofNullable(handlerMap.get(logoutHandlerBeanId));
    }
}
