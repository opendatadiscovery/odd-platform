package org.opendatadiscovery.oddplatform.config;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.IteratorUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.auth.handler.OAuthUserHandler;
import org.opendatadiscovery.oddplatform.auth.handler.OidcUserHandler;
import org.opendatadiscovery.oddplatform.auth.logout.OAuthLogoutSuccessHandler;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.ReactiveOAuth2UserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring5.context.webflux.SpringWebFluxContext;
import reactor.core.publisher.Mono;

import static org.springframework.security.config.Customizer.withDefaults;
import static org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers.pathMatchers;

@Configuration
@ConditionalOnProperty(value = "auth.type", havingValue = "OAUTH2")
@EnableReactiveMethodSecurity
@RequiredArgsConstructor
public class OAuthSecurityConfiguration {
    private final Map<String, OidcUserHandler> oidcUserHandlerMap;
    private final Map<String, OAuthUserHandler> oauthUserHandlerMap;

    @Bean
    public SecurityWebFilterChain securityWebFilterChainOauth2Client(final ServerHttpSecurity http,
                                                                     final OAuthLogoutSuccessHandler logoutHandler,
                                                                     final ReactiveClientRegistrationRepository repo,
                                                                     final TemplateEngine templateEngine) {
        final List<ClientRegistration> clientRegistrations =
            IteratorUtils.toList(((InMemoryReactiveClientRegistrationRepository) repo).iterator());

        ServerHttpSecurity sec = http
            .cors().and()
            .csrf().disable()
            .securityMatcher(new PathPatternParserServerWebExchangeMatcher("/**"))
            .authorizeExchange(e -> e
                .pathMatchers("/actuator/**", "/favicon.ico", "/ingestion/**", "/img/**").permitAll()
                .pathMatchers("/**").authenticated())
            .oauth2Login(withDefaults())
            .logout()
            .logoutSuccessHandler(logoutHandler)
            .and();

        if (clientRegistrations.size() > 1) {
            sec = sec
                .addFilterAfter(new LoginPageFilter(templateEngine, clientRegistrations), SecurityWebFiltersOrder.CSRF);
        }

        return sec.build();
    }

    @Bean
    public ReactiveOAuth2UserService<OidcUserRequest, OidcUser> customOidcUserService() {
        final OidcReactiveOAuth2UserService delegate = new OidcReactiveOAuth2UserService();
        return request -> delegate.loadUser(request)
            .flatMap(oidcUser -> {
                final Optional<OidcUserHandler> userHandler =
                    getOidcUserHandler(request.getClientRegistration().getRegistrationId());
                if (userHandler.isEmpty()) {
                    return Mono.just(oidcUser);
                }
                return userHandler.get().enrichUserWithProviderInformation(oidcUser, request);
            });
    }

    @Bean
    public ReactiveOAuth2UserService<OAuth2UserRequest, OAuth2User> customOauth2UserService() {
        final DefaultReactiveOAuth2UserService delegate = new DefaultReactiveOAuth2UserService();
        return request -> delegate.loadUser(request)
            .flatMap(user -> {
                final Optional<OAuthUserHandler> userHandler =
                    getOAuthUserHandler(request.getClientRegistration().getRegistrationId());
                if (userHandler.isEmpty()) {
                    return Mono.just(user);
                }
                return userHandler.get().enrichUserWithProviderInformation(user, request);
            });
    }

    private Optional<OidcUserHandler> getOidcUserHandler(final String providerId) {
        final String userHandlerBeanId = providerId + "UserHandler";
        return Optional.ofNullable(oidcUserHandlerMap.get(userHandlerBeanId));
    }

    private Optional<OAuthUserHandler> getOAuthUserHandler(final String providerId) {
        final String userHandlerBeanId = providerId + "UserHandler";
        return Optional.ofNullable(oauthUserHandlerMap.get(userHandlerBeanId));
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
