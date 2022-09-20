package org.opendatadiscovery.oddplatform.auth.logout;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.auth.ODDOAuth2Properties;
import org.opendatadiscovery.oddplatform.auth.Provider;
import org.opendatadiscovery.oddplatform.auth.condition.GithubCondition;
import org.opendatadiscovery.oddplatform.auth.util.UriUtils;
import org.springframework.context.annotation.Conditional;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
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
@Conditional(GithubCondition.class)
@RequiredArgsConstructor
public class GithubLogoutSuccessHandler implements LogoutSuccessHandler {
    private static final String GITHUB_ACCEPT_HEADER = "application/vnd.github+json";
    private final WebClient webClient = WebClient.create("https://api.github.com");
    private final ReactiveOAuth2AuthorizedClientService auth2AuthorizedClientService;

    @Override
    public boolean shouldHandle(final String provider) {
        return provider.equalsIgnoreCase(Provider.GITHUB.name());
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
        final String base64 = Base64.getEncoder()
            .encodeToString((provider.getClientId() + ":" + provider.getClientSecret()).getBytes());

        return auth2AuthorizedClientService
            .loadAuthorizedClient(oauthToken.getAuthorizedClientRegistrationId(), oauthToken.getName())
            .flatMap(client -> webClient
                .method(HttpMethod.DELETE)
                .uri(uriBuilder -> uriBuilder.path("/applications/{client_id}/grant").build(provider.getClientId()))
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> {
                    headers.set(HttpHeaders.ACCEPT, GITHUB_ACCEPT_HEADER);
                    headers.set(HttpHeaders.AUTHORIZATION, "Basic " + base64);
                })
                .bodyValue(new LogoutBody(client.getAccessToken().getTokenValue()))
                .retrieve()
                .toBodilessEntity())
            .then(Mono.defer(() -> exchange.getExchange().getSession().flatMap(WebSession::invalidate)))
            .onErrorResume(e -> Mono.defer(() -> exchange.getExchange().getSession().flatMap(WebSession::invalidate)));
    }

    private record LogoutBody(@JsonProperty("access_token") String accessToken) {
    }
}