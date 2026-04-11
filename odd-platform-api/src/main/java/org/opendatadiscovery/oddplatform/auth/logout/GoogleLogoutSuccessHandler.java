package org.opendatadiscovery.oddplatform.auth.logout;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.auth.ODDOAuth2Properties;
import org.opendatadiscovery.oddplatform.auth.Provider;
import org.opendatadiscovery.oddplatform.auth.condition.GoogleCondition;
import org.opendatadiscovery.oddplatform.auth.util.UriUtils;
import org.springframework.context.annotation.Conditional;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;

@Component
@Conditional(GoogleCondition.class)
@RequiredArgsConstructor
public class GoogleLogoutSuccessHandler implements LogoutSuccessHandler {
    private final WebClient webClient = WebClient.create("https://oauth2.googleapis.com");
    private final ReactiveOAuth2AuthorizedClientService auth2AuthorizedClientService;

    @Override
    public boolean shouldHandle(final String provider) {
        return provider.equalsIgnoreCase(Provider.GOOGLE.name());
    }

    @Override
    public Mono<Void> handle(final WebFilterExchange exchange,
                             final Authentication authentication,
                             final ODDOAuth2Properties.OAuth2Provider provider) {
        final ServerHttpResponse response = exchange.getExchange().getResponse();
        response.setStatusCode(HttpStatus.FOUND);
        final var requestUri = exchange.getExchange().getRequest().getURI();
        response.getHeaders().setLocation(UriUtils.getBaseUri(requestUri));

        final OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        return auth2AuthorizedClientService
            .loadAuthorizedClient(oauthToken.getAuthorizedClientRegistrationId(), oauthToken.getName())
            .flatMap(client ->
                webClient
                    .post()
                    .uri(uriBuilder -> uriBuilder.path("/revoke")
                        .queryParam("token", client.getAccessToken().getTokenValue())
                        .build()
                    )
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .retrieve()
                    .bodyToMono(String.class))
            .then(Mono.defer(() -> exchange.getExchange().getSession().flatMap(WebSession::invalidate)))
            .onErrorResume(e -> Mono.defer(() -> exchange.getExchange().getSession().flatMap(WebSession::invalidate)));
    }
}
