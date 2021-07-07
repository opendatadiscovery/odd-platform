package com.provectus.oddplatform.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@EnableWebFluxSecurity
@Configuration
public class SecurityConfiguration {
    @Bean
    @ConditionalOnProperty(value = "auth.enabled", havingValue = "false")
    public SecurityWebFilterChain securityWebFilterChainLocal(final ServerHttpSecurity http) {
        return http
            .csrf().disable()
            .authorizeExchange()
            .anyExchange().permitAll()
            .and()
            .build();
    }

    @Bean
    @ConditionalOnProperty(value = "auth.enabled", havingValue = "true")
    public SecurityWebFilterChain securityWebFilterChain(final ServerHttpSecurity http) {
        return http
            .csrf().disable()
            .authorizeExchange()
            .pathMatchers("/ingestion/entities").permitAll()
            .pathMatchers("/health").permitAll()
            .pathMatchers("/**").authenticated()
            .and().oauth2Login()
            .and().build();
    }

    @Bean
    public WebFilter corsFilter() {
        return (final ServerWebExchange ctx, final WebFilterChain chain) -> {
            final ServerHttpRequest request = ctx.getRequest();

            final ServerHttpResponse response = ctx.getResponse();
            final HttpHeaders headers = response.getHeaders();
            headers.add("Access-Control-Allow-Origin", "*");
            headers.add("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
            headers.add("Access-Control-Max-Age", "3600");
            headers.add("Access-Control-Allow-Headers", "Content-Type");

            if (request.getMethod() == HttpMethod.OPTIONS) {
                response.setStatusCode(HttpStatus.OK);
                return Mono.empty();
            }

            return chain.filter(ctx);
        };
    }
}
