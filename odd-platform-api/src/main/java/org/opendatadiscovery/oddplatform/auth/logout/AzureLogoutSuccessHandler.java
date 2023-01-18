package org.opendatadiscovery.oddplatform.auth.logout;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.auth.ODDOAuth2Properties;
import org.opendatadiscovery.oddplatform.auth.Provider;
import org.opendatadiscovery.oddplatform.auth.condition.AzureCondition;
import org.opendatadiscovery.oddplatform.auth.util.UriUtils;
import org.springframework.context.annotation.Conditional;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.stereotype.Component;
import org.springframework.web.server.WebSession;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

@Component
@Conditional(AzureCondition.class)
@RequiredArgsConstructor
public class AzureLogoutSuccessHandler implements LogoutSuccessHandler {

    @Override
    public boolean shouldHandle(final String provider) {
        return provider.equalsIgnoreCase(Provider.AZURE.name());
    }

    @Override
    public Mono<Void> handle(final WebFilterExchange exchange,
                             final Authentication authentication,
                             final ODDOAuth2Properties.OAuth2Provider provider) {
        final ServerHttpResponse response = exchange.getExchange().getResponse();
        response.setStatusCode(HttpStatus.FOUND);
        final var requestUri = exchange.getExchange().getRequest().getURI();

        final var uri = UriComponentsBuilder
            .fromUri(URI.create(provider.getLogoutUri()))
            .queryParam("post_logout_redirect_uri", UriUtils.getBaseUri(requestUri))
            .queryParam("client_id", provider.getClientId())
            .encode(StandardCharsets.UTF_8)
            .build()
            .toUri();

        response.getHeaders().setLocation(uri);
        return exchange.getExchange().getSession().flatMap(WebSession::invalidate);
    }
}