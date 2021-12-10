package org.opendatadiscovery.oddplatform.config;

import org.opendatadiscovery.oddplatform.auth.CognitoOidcLogoutSuccessHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.oidc.web.server.logout.OidcClientInitiatedServerLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher;

@Configuration
@ConditionalOnProperty(value = "auth.type", havingValue = "OAUTH2")
public class OAuthSecurityConfiguration {

    private final Boolean cognitoEnabled;
    private final String clientId;
    private final String logoutUrl;

    public OAuthSecurityConfiguration(
        @Value("${cognito.enabled}") final Boolean cognitoEnabled,
        @Value("${spring.security.oauth2.client.registration.cognito.client-id:}") final String clientId,
        @Value("${cognito.logoutUrl:}") final String logoutUrl) {
        this.cognitoEnabled = cognitoEnabled;
        this.clientId = clientId;
        this.logoutUrl = logoutUrl;
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public SecurityWebFilterChain securityWebFilterChainOauth2ResourceServer(final ServerHttpSecurity http,
                                                                             final ReactiveClientRegistrationRepository
                                                                                 repo) {
        final ServerLogoutSuccessHandler logoutHandler = cognitoEnabled
            ? new CognitoOidcLogoutSuccessHandler(logoutUrl, clientId)
            : new OidcClientInitiatedServerLogoutSuccessHandler(repo);

        return http
            .cors().and()
            .csrf().disable()
            .securityMatcher(new PathPatternParserServerWebExchangeMatcher("/ingestion/**"))
            .authorizeExchange(e -> e
                .pathMatchers("/ingestion/entities").permitAll()
                .pathMatchers("/actuator/**").permitAll()
                .pathMatchers("/**").authenticated())
            .oauth2ResourceServer(ServerHttpSecurity.OAuth2ResourceServerSpec::jwt)
            .logout()
            .logoutSuccessHandler(logoutHandler)
            .and()
            .build();
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChainOauth2Client(final ServerHttpSecurity http,
                                                                     final ReactiveClientRegistrationRepository repo) {
        final ServerLogoutSuccessHandler logoutHandler = cognitoEnabled
            ? new CognitoOidcLogoutSuccessHandler(logoutUrl, clientId)
            : new OidcClientInitiatedServerLogoutSuccessHandler(repo);

        return http
            .cors().and()
            .csrf().disable()
            .securityMatcher(new PathPatternParserServerWebExchangeMatcher("/**"))
            .authorizeExchange(e -> e
                .pathMatchers("/health", "/favicon.ico").permitAll()
                .pathMatchers("/**").authenticated())
            .oauth2Login(Customizer.withDefaults())
            .logout()
            .logoutSuccessHandler(logoutHandler)
            .and()
            .build();
    }
}
