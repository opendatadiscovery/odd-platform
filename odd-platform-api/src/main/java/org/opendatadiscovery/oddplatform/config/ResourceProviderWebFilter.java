package org.opendatadiscovery.oddplatform.config;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
public class ResourceProviderWebFilter implements WebFilter {

    @Override
    public Mono<Void> filter(final ServerWebExchange exchange, final WebFilterChain chain) {
        final String requestPath = exchange.getRequest().getURI().getPath();

        if (requestPath.startsWith("/api")
            || requestPath.startsWith("/ingestion")
            || requestPath.startsWith("/actuator")) {
            return chain.filter(exchange);
        }

        if (requestPath.startsWith("/static")
            || requestPath.equals("/manifest.json")
            || requestPath.startsWith("/favicon.ico")) {
            final ServerHttpRequest exchangeRequest = exchange.getRequest().mutate()
                .header("Cache-Control", "No-Cache")
                .build();

            return chain.filter(exchange.mutate().request(exchangeRequest).build());
        }

        final ServerHttpRequest exchangeRequest = exchange.getRequest().mutate()
            .path("/index.html")
            .header("Cache-Control", "No-Cache")
            .build();

        return chain.filter(exchange.mutate()
            .request(exchangeRequest)
            .build());
    }
}
