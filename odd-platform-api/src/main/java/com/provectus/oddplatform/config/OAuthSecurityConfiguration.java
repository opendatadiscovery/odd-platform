package com.provectus.oddplatform.config;


import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher;

@Configuration
@ConditionalOnProperty(value = "auth.type", havingValue = "OAUTH2")
public class OAuthSecurityConfiguration {
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public SecurityWebFilterChain securityWebFilterChainOauth2ResourceServer(final ServerHttpSecurity http) {
        return http
            .securityMatcher(new PathPatternParserServerWebExchangeMatcher("/ingestion/**"))
            .authorizeExchange(e -> e.anyExchange().authenticated())
            .oauth2ResourceServer(ServerHttpSecurity.OAuth2ResourceServerSpec::jwt)
            .build();
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChainOauth2Client(final ServerHttpSecurity http) {
        return http
            .csrf().disable()
            .securityMatcher(new PathPatternParserServerWebExchangeMatcher("/**"))
            .authorizeExchange(e -> e
                .pathMatchers("/health", "/favicon.ico").permitAll()
                .pathMatchers("/**").authenticated())
            .oauth2Login(Customizer.withDefaults())
            .build();
    }
}
