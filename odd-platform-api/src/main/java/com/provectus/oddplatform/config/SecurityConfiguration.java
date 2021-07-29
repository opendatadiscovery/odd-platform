package com.provectus.oddplatform.config;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.userdetails.MapReactiveUserDetailsService;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.DefaultServerRedirectStrategy;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@EnableWebFluxSecurity
@Configuration
@Slf4j
public class SecurityConfiguration {
    @Bean
    @ConditionalOnProperty(value = "auth.type", havingValue = "DISABLED")
    public SecurityWebFilterChain securityWebFilterChainDisabled(final ServerHttpSecurity http) {
        return http
            .csrf().disable()
            .authorizeExchange()
            .anyExchange().permitAll()
            .and().build();
    }

    @Bean
    @ConditionalOnProperty(value = "auth.type", havingValue = "OAUTH2")
    public SecurityWebFilterChain securityWebFilterChainOauth2(final ServerHttpSecurity http) {
        return applyAuthPathMatchers(http)
            .and().oauth2Login()
            .and().build();
    }

    @Bean
    @ConditionalOnProperty(value = "auth.type", havingValue = "LOGIN_FORM")
    public SecurityWebFilterChain securityWebFilterChainLoginForm(
        final ServerHttpSecurity http,
        @Value("${auth.login-form-redirect:}") final String redirectURIString
    ) {
        final URI redirectURI = parseURI(redirectURIString);

        final ServerAuthenticationSuccessHandler authHandler = redirectURI != null
            ? (wfe, auth) -> new DefaultServerRedirectStrategy().sendRedirect(wfe.getExchange(), redirectURI)
            : new RedirectServerAuthenticationSuccessHandler("/");

        return applyAuthPathMatchers(http)
            .and().formLogin().authenticationSuccessHandler(authHandler)
            .and().build();
    }

    @Bean
    @ConditionalOnProperty(value = "auth.type", havingValue = "LOGIN_FORM")
    public MapReactiveUserDetailsService mapReactiveUserDetailsService(
        @Value("${auth.login-form-credentials}") final String credentialString
    ) {
        final PasswordEncoder pe = PasswordEncoderFactories.createDelegatingPasswordEncoder();

        final List<UserDetails> users = Arrays
            .stream(credentialString.split(","))
            .map(LoginFormCredentials::parseCredentialString)
            .map(c -> User
                .withUsername(c.getUsername())
                .passwordEncoder(pe::encode)
                .password(c.getPassword())
                .authorities("ROLE_USER")
                .build())
            .collect(Collectors.toList());

        return new MapReactiveUserDetailsService(users);
    }

    private ServerHttpSecurity.AuthorizeExchangeSpec applyAuthPathMatchers(final ServerHttpSecurity http) {
        return http
            .csrf().disable()
            .authorizeExchange()
            .pathMatchers("/ingestion/entities").permitAll()
            .pathMatchers("/health").permitAll()
            .pathMatchers("/**").authenticated();
    }

    private URI parseURI(final String redirectUri) {
        return StringUtils.hasLength(redirectUri) ? URI.create(redirectUri) : null;
    }

    @Getter
    @RequiredArgsConstructor
    @Slf4j
    private static class LoginFormCredentials {
        private final String username;
        private final String password;

        private static LoginFormCredentials parseCredentialString(final String credentialString) {
            final String[] credentials = credentialString.split(":");

            return new LoginFormCredentials(credentials[0].trim(), credentials[1].trim());
        }
    }
}
