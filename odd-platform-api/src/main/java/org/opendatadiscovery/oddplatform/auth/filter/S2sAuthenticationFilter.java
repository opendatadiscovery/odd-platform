package org.opendatadiscovery.oddplatform.auth.filter;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.auth.S2sTokenProvider;
import org.opendatadiscovery.oddplatform.auth.mapper.GrantedAuthorityExtractor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class S2sAuthenticationFilter implements WebFilter {
    private static final String X_API_KEY_HEADER = "X-API-Key";

    private final GrantedAuthorityExtractor grantedAuthorityExtractor;
    private final S2sTokenProvider s2sTokenProvider;

    @Override
    public Mono<Void> filter(final ServerWebExchange exchange, final WebFilterChain chain) {
        if (!s2sTokenProvider.isValidToken(extractTokenFromRequest(exchange))) {
            return chain.filter(exchange);
        }

        final UserDetails userDetails = User.withUsername("ADMIN")
            .password("")
            .roles("ADMIN")
            .build();

        return chain.filter(exchange)
            .contextWrite(ReactiveSecurityContextHolder.withAuthentication(
                new UsernamePasswordAuthenticationToken(userDetails, null,
                    grantedAuthorityExtractor.getAuthorities(true))));
    }

    private String extractTokenFromRequest(final ServerWebExchange exchange) {
        final List<String> authorizationHeaders = exchange.getRequest().getHeaders().get(X_API_KEY_HEADER);
        if (authorizationHeaders != null && !authorizationHeaders.isEmpty()) {
            return authorizationHeaders.get(0);
        }
        return null;
    }
}