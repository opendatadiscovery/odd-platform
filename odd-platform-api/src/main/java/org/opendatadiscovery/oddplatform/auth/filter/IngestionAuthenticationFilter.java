package org.opendatadiscovery.oddplatform.auth.filter;

import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveCollectorRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.server.util.matcher.AndServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.NegatedServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.OrServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Uniform authentication gate for the ingestion ingress (odd-platform issue #1740).
 *
 * <p>{@code /ingestion/**} is whitelisted out of the central Spring Security chain
 * ({@code SecurityConstants.WHITELIST_PATHS}); per-path {@link WebFilter}s protect it instead. The two
 * pre-existing filters ({@link IngestionDataSourceFilter}, {@link IngestionDataEntitiesFilter}) use
 * EXACT-path matchers ({@code /ingestion/datasources}, {@code /ingestion/entities}), so every sibling route —
 * {@code /ingestion/entities/datasets/stats}, {@code /ingestion/metrics}, the
 * {@code GET /ingestion/entities/degs/children} read — was reachable with no token even when
 * {@code auth.ingestion.filter.enabled=true}.
 *
 * <p>This filter closes that gap: when the flag is on it requires a registered collector- or
 * datasource-Bearer token across ALL of {@code /ingestion/**} EXCEPT the two paths that already have a
 * dedicated filter ({@code /ingestion/entities}, {@code /ingestion/datasources}). The Prometheus Alertmanager
 * webhook ({@code /ingestion/alert/**}) is covered too — the operator configures Alertmanager's
 * {@code http_config} to send the token. It enforces authentication only; the per-datasource authorization on
 * {@code /ingestion/entities} stays in {@link IngestionDataEntitiesFilter}.
 *
 * <p>Unlike {@link AbstractIngestionFilter}, the check is EAGER (in {@link #filter}, not inside a request-body
 * decorator) so it also covers body-less GET routes such as the DEG-children read.
 */
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(value = "auth.ingestion.filter.enabled", havingValue = "true")
public class IngestionAuthenticationFilter implements WebFilter {

    private static final String BEARER = "bearer ";

    private final ReactiveCollectorRepository collectorRepository;
    private final ReactiveDataSourceRepository dataSourceRepository;

    private final ServerWebExchangeMatcher matcher = new AndServerWebExchangeMatcher(
        ServerWebExchangeMatchers.pathMatchers("/ingestion/**"),
        new NegatedServerWebExchangeMatcher(new OrServerWebExchangeMatcher(
            ServerWebExchangeMatchers.pathMatchers("/ingestion/entities"),
            ServerWebExchangeMatchers.pathMatchers("/ingestion/datasources")
        ))
    );

    @Override
    public Mono<Void> filter(final ServerWebExchange exchange, final WebFilterChain chain) {
        return matcher.matches(exchange).flatMap(match -> {
            if (!match.isMatch()) {
                return chain.filter(exchange);
            }
            return authenticate(exchange.getRequest())
                .flatMap(authenticated -> chain.filter(exchange))
                .onErrorResume(AccessDeniedException.class, e -> unauthorized(exchange, e.getMessage()));
        });
    }

    private Mono<Boolean> authenticate(final ServerHttpRequest request) {
        final String header = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (!StringUtils.hasText(header) || !header.toLowerCase().startsWith(BEARER)) {
            return Mono.error(new AccessDeniedException("Ingestion token is missing"));
        }
        final String token = header.substring(BEARER.length());
        return collectorRepository.getByToken(token)
            .map(collector -> true)
            .switchIfEmpty(Mono.defer(() -> dataSourceRepository.getByToken(token).map(dataSource -> true)))
            .switchIfEmpty(Mono.error(new AccessDeniedException("Ingestion token is not recognised")));
    }

    private Mono<Void> unauthorized(final ServerWebExchange exchange, final String message) {
        final ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        return response.writeWith(Mono.fromCallable(
            () -> response.bufferFactory().wrap(message.getBytes(StandardCharsets.UTF_8))));
    }
}
