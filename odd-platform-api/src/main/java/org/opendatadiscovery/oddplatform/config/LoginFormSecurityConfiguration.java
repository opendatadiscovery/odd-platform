package org.opendatadiscovery.oddplatform.config;

import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.auth.mapper.GrantedAuthorityExtractor;
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

@Configuration
@ConditionalOnProperty(value = "auth.type", havingValue = "LOGIN_FORM")
@EnableWebFluxSecurity
@RequiredArgsConstructor
public class LoginFormSecurityConfiguration {
    private final GrantedAuthorityExtractor grantedAuthorityExtractor;

    @Bean
    public SecurityWebFilterChain securityWebFilterChainLoginForm(
        final ServerHttpSecurity http,
        @Value("${auth.login-form-redirect:}") final String redirectURIString
    ) {
        final URI redirectURI = parseURI(redirectURIString);

        final ServerAuthenticationSuccessHandler authHandler = redirectURI != null
            ? (wfe, auth) -> new DefaultServerRedirectStrategy().sendRedirect(wfe.getExchange(), redirectURI)
            : new RedirectServerAuthenticationSuccessHandler("/");

        return http
            .csrf().disable()
            .authorizeExchange()
            .pathMatchers("/actuator/health", "/favicon.ico", "/ingestion/entities").permitAll()
            .pathMatchers("/**").authenticated()
            .and().formLogin().authenticationSuccessHandler(authHandler)
            .and().logout()
            .and().build();
    }

    @Bean
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
                .authorities(grantedAuthorityExtractor.getAuthorities(true))
                .build())
            .collect(Collectors.toList());

        return new MapReactiveUserDetailsService(users);
    }

    private URI parseURI(final String redirectUri) {
        return StringUtils.hasLength(redirectUri) ? URI.create(redirectUri) : null;
    }

    @Getter
    @RequiredArgsConstructor
    private static class LoginFormCredentials {
        private final String username;
        private final String password;

        private static LoginFormCredentials parseCredentialString(final String credentialString) {
            final String[] credentials = credentialString.split(":");

            return new LoginFormCredentials(credentials[0].trim(), credentials[1].trim());
        }
    }
}
