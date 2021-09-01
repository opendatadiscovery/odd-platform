package com.provectus.oddplatform.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.security.web.util.UrlUtils;
import org.springframework.web.server.WebSession;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.nio.charset.StandardCharsets;

public class CognitoOidcLogoutSuccessHandler implements ServerLogoutSuccessHandler {

    private final String logoutUrl;
    private final String clientId;

    public CognitoOidcLogoutSuccessHandler(String logoutUrl, String clientId) {
        this.logoutUrl = logoutUrl;
        this.clientId = clientId;
    }

    // non reactive way, fyi // TODO REMOVE
    /*@Override
    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {

        UriComponents baseUrl = UriComponentsBuilder
                .fromHttpUrl(UrlUtils.buildFullRequestUrl(request))
                .replacePath(request.getContextPath())
                .replaceQuery(null)
                .fragment(null)
                .build();

        return UriComponentsBuilder
                .fromUri(URI.create(logoutUrl))
                .queryParam("client_id", clientId)
                .queryParam("logout_uri", baseUrl)
                .encode(StandardCharsets.UTF_8)
                .build()
                .toUriString();
    }*/

    @Override
    public Mono<Void> onLogoutSuccess(WebFilterExchange exchange, Authentication authentication) {
        ServerHttpResponse response = exchange.getExchange().getResponse();
        response.setStatusCode(HttpStatus.FOUND);

        final var requestUri = exchange.getExchange().getRequest().getURI();

        final var fullUrl = UrlUtils.buildFullRequestUrl(requestUri.getScheme(), // might be wrong but idk
                requestUri.getHost(), requestUri.getPort(),
                requestUri.getPath(), requestUri.getQuery());

        UriComponents baseUrl = UriComponentsBuilder
                .fromHttpUrl(fullUrl)
                .replacePath(exchange.getExchange().getRequest().getPath().toString())
                .replaceQuery(null)
                .fragment(null)
                .build();

        var uri = UriComponentsBuilder
                .fromUri(URI.create(logoutUrl))
                .queryParam("client_id", clientId)
                .queryParam("logout_uri", baseUrl)
                .encode(StandardCharsets.UTF_8)
                .build()
                .toUri();


        response.getHeaders().setLocation(uri);
        response.getCookies().remove("SESSION"); // should be done by spring automatically actually
        return exchange.getExchange().getSession().flatMap(WebSession::invalidate);
    }
}
