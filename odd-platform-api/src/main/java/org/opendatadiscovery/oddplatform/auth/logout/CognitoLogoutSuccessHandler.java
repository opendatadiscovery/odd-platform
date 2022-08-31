package org.opendatadiscovery.oddplatform.auth.logout;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import org.opendatadiscovery.oddplatform.auth.condition.CognitoCondition;
import org.opendatadiscovery.oddplatform.auth.util.UriUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Conditional;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.stereotype.Component;
import org.springframework.web.server.WebSession;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

@Component("cognitoLogoutHandler")
@Conditional(CognitoCondition.class)
public class CognitoLogoutSuccessHandler implements LogoutSuccessHandler {

    @Value("${spring.security.oauth2.client.provider.cognito.logoutUri:}")
    private String logoutUrl;

    @Value("${spring.security.oauth2.client.registration.cognito.client-id:}")
    private String clientId;

    public Mono<Void> handle(final WebFilterExchange exchange, final Authentication authentication) {
        final ServerHttpResponse response = exchange.getExchange().getResponse();
        response.setStatusCode(HttpStatus.FOUND);
        final var requestUri = exchange.getExchange().getRequest().getURI();

        final var uri = UriComponentsBuilder
            .fromUri(URI.create(logoutUrl))
            .queryParam("client_id", clientId)
            .queryParam("logout_uri", UriUtils.getBaseUri(requestUri))
            .encode(StandardCharsets.UTF_8)
            .build()
            .toUri();

        response.getHeaders().setLocation(uri);
        return exchange.getExchange().getSession().flatMap(WebSession::invalidate);
    }
}
