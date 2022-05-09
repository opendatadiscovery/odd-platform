package org.opendatadiscovery.oddplatform.config;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.apache.commons.collections4.IteratorUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.auth.CognitoOidcLogoutSuccessHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.oidc.web.server.logout.OidcClientInitiatedServerLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring5.context.webflux.SpringWebFluxContext;
import reactor.core.publisher.Mono;

import static org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers.pathMatchers;

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
    public SecurityWebFilterChain securityWebFilterChainOauth2Client(final ServerHttpSecurity http,
                                                                     final ReactiveClientRegistrationRepository repo,
                                                                     final TemplateEngine templateEngine) {
        final ServerLogoutSuccessHandler logoutHandler = cognitoEnabled
            ? new CognitoOidcLogoutSuccessHandler(logoutUrl, clientId)
            : new OidcClientInitiatedServerLogoutSuccessHandler(repo);

        final List<ClientRegistration> clientRegistrations =
            IteratorUtils.toList(((InMemoryReactiveClientRegistrationRepository) repo).iterator());

        ServerHttpSecurity sec = http
            .cors().and()
            .csrf().disable()
            .securityMatcher(new PathPatternParserServerWebExchangeMatcher("/**"))
            .authorizeExchange(e -> e
                .pathMatchers("/actuator/**", "/favicon.ico", "/ingestion/**", "/img/**").permitAll()
                .pathMatchers("/**").authenticated())
            .oauth2Login(Customizer.withDefaults())
            .logout().logoutSuccessHandler(logoutHandler)
            .and();

        if (clientRegistrations.size() > 1) {
            sec = sec
                .addFilterAfter(new LoginPageFilter(templateEngine, clientRegistrations), SecurityWebFiltersOrder.CSRF);
        }

        return sec.build();
    }

    private static class LoginPageFilter implements WebFilter {
        private static final String CLIENT_REGISTRATION_IMAGE_SOURCE = "/img/%s.png";
        private static final String CLIENT_REGISTRATION_HREF = "/oauth2/authorization/%s";

        private final ServerWebExchangeMatcher matcher = pathMatchers(HttpMethod.GET, "/login");

        private final TemplateEngine templateEngine;
        private final List<ClientRegistrationModel> clientRegistrations;

        public LoginPageFilter(final TemplateEngine templateEngine,
                               final List<ClientRegistration> clientRegistrations) {
            this.clientRegistrations = clientRegistrations.stream()
                .map(this::mapClientRegistration)
                .toList();

            this.templateEngine = templateEngine;
        }

        @Override
        public Mono<Void> filter(final ServerWebExchange exchange, final WebFilterChain chain) {
            return this.matcher.matches(exchange)
                .filter(ServerWebExchangeMatcher.MatchResult::isMatch)
                .switchIfEmpty(chain.filter(exchange).then(Mono.empty()))
                .flatMap(matchResult -> render(exchange));
        }

        protected Mono<Void> render(final ServerWebExchange exchange) {
            final ServerHttpResponse result = exchange.getResponse();
            result.setStatusCode(HttpStatus.OK);
            result.getHeaders().setContentType(MediaType.TEXT_HTML);

            return result.writeWith(response(exchange).map(r -> exchange.getResponse().bufferFactory().wrap(r)));
        }

        protected Mono<byte[]> response(final ServerWebExchange exchange) {
            final SpringWebFluxContext context =
                new SpringWebFluxContext(exchange, null, resolveContextVariables(exchange));

            return Mono.just(
                this.templateEngine.process("oauth2_login.html", context).getBytes(StandardCharsets.UTF_8)
            );
        }

        private Map<String, Object> resolveContextVariables(final ServerWebExchange exchange) {
            return Map.of(
                "error", exchange.getRequest().getQueryParams().containsKey("error"),
                "regs", clientRegistrations
            );
        }

        private ClientRegistrationModel mapClientRegistration(final ClientRegistration cr) {
            return new ClientRegistrationModel(
                StringUtils.defaultIfBlank(cr.getClientName(), cr.getRegistrationId()),
                CLIENT_REGISTRATION_IMAGE_SOURCE.formatted(cr.getRegistrationId()),
                CLIENT_REGISTRATION_HREF.formatted(cr.getRegistrationId())
            );
        }

        private record ClientRegistrationModel(String name, String imgSrc, String href) {
        }
    }
}
