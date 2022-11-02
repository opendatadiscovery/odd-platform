package org.opendatadiscovery.oddplatform.config;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.IteratorUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.auth.ODDOAuth2Properties;
import org.opendatadiscovery.oddplatform.auth.ODDOAuth2PropertiesConverter;
import org.opendatadiscovery.oddplatform.auth.Provider;
import org.opendatadiscovery.oddplatform.auth.authorization.AuthorizationCustomizer;
import org.opendatadiscovery.oddplatform.auth.handler.OAuthUserHandler;
import org.opendatadiscovery.oddplatform.auth.logout.OAuthLogoutSuccessHandler;
import org.opendatadiscovery.oddplatform.auth.manager.extractor.ResourceExtractor;
import org.opendatadiscovery.oddplatform.dto.security.UserProviderRole;
import org.opendatadiscovery.oddplatform.service.permission.PermissionService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientPropertiesRegistrationAdapter;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.web.server.logout.OidcClientInitiatedServerLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.ReactiveOAuth2UserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
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

import static org.opendatadiscovery.oddplatform.dto.security.UserProviderRole.USER;
import static org.springframework.security.config.Customizer.withDefaults;
import static org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers.pathMatchers;

@Configuration
@ConditionalOnProperty(value = "auth.type", havingValue = "OAUTH2")
@EnableConfigurationProperties(ODDOAuth2Properties.class)
@EnableReactiveMethodSecurity
@EnableWebFluxSecurity
@RequiredArgsConstructor
public class OAuthSecurityConfiguration {
    private final ODDOAuth2Properties properties;
    private final List<OAuthUserHandler<OAuth2User, OAuth2UserRequest>> oauthUserHandlers;
    private final List<OAuthUserHandler<OidcUser, OidcUserRequest>> oidcUserHandlers;

    @Bean
    public SecurityWebFilterChain securityWebFilterChainOauth2Client(
        final ServerHttpSecurity http,
        final OAuthLogoutSuccessHandler logoutHandler,
        final ReactiveClientRegistrationRepository repo,
        final PermissionService permissionService,
        final List<ResourceExtractor> extractors,
        final TemplateEngine templateEngine) {
        final List<ClientRegistration> clientRegistrations =
            IteratorUtils.toList(((InMemoryReactiveClientRegistrationRepository) repo).iterator());

        ServerHttpSecurity sec = http
            .cors().and()
            .csrf().disable()
            .securityMatcher(new PathPatternParserServerWebExchangeMatcher("/**"))
            .authorizeExchange(new AuthorizationCustomizer(permissionService, extractors))
            .oauth2Login(withDefaults())
            .logout()
            .logoutSuccessHandler(logoutHandler)
            .and();

        if (clientRegistrations.size() > 1) {
            sec = sec
                .addFilterAfter(new LoginPageFilter(templateEngine, clientRegistrations, properties),
                    SecurityWebFiltersOrder.CSRF);
        }

        return sec.build();
    }

    @Bean
    public ReactiveOAuth2UserService<OidcUserRequest, OidcUser> customOidcUserService() {
        final OidcReactiveOAuth2UserService delegate = new OidcReactiveOAuth2UserService();
        return request -> delegate.loadUser(request)
            .flatMap(oidcUser -> {
                final var handler = getOidcUserHandler(request.getClientRegistration().getRegistrationId());
                if (handler.isEmpty()) {
                    return Mono.just(oidcUser);
                }
                return handler.get().enrichUserWithProviderInformation(oidcUser, request);
            });
    }

    @Bean
    public ReactiveOAuth2UserService<OAuth2UserRequest, OAuth2User> customOauth2UserService() {
        final DefaultReactiveOAuth2UserService delegate = new DefaultReactiveOAuth2UserService();
        return request -> delegate.loadUser(request)
            .flatMap(user -> {
                final var handler = getOAuthUserHandler(request.getClientRegistration().getRegistrationId());
                if (handler.isEmpty()) {
                    return Mono.just(user);
                }
                return handler.get().enrichUserWithProviderInformation(user, request);
            });
    }

    @Bean
    public GrantedAuthoritiesMapper grantedAuthoritiesMapper() {
        return authorities -> {
            if (CollectionUtils.isEmpty(authorities)) {
                return Set.of(new SimpleGrantedAuthority(USER.name()));
            }
            final Set<String> grantedAuthorities = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
            final boolean containsProviderRole = Stream.of(UserProviderRole.values())
                .map(UserProviderRole::name)
                .anyMatch(grantedAuthorities::contains);
            if (containsProviderRole) {
                return authorities;
            }
            return Set.of(new SimpleGrantedAuthority(USER.name()));
        };
    }

    @Bean
    public InMemoryReactiveClientRegistrationRepository clientRegistrationRepository() {
        final OAuth2ClientProperties props = ODDOAuth2PropertiesConverter.convertOddProperties(properties);
        final List<ClientRegistration> registrations =
            OAuth2ClientPropertiesRegistrationAdapter.getClientRegistrations(props).values().stream()
                .map(cr -> {
                    final ODDOAuth2Properties.OAuth2Provider provider =
                        properties.getClient().get(cr.getRegistrationId());
                    if (provider.getProvider().equalsIgnoreCase(Provider.GOOGLE.name())
                        && StringUtils.isNotEmpty(provider.getAllowedDomain())) {
                        final String newUri =
                            cr.getProviderDetails().getAuthorizationUri() + "?hd=" + provider.getAllowedDomain();
                        return ClientRegistration.withClientRegistration(cr).authorizationUri(newUri).build();
                    } else {
                        return cr;
                    }
                }).toList();
        return new InMemoryReactiveClientRegistrationRepository(registrations);
    }

    @Bean
    public ServerLogoutSuccessHandler defaultOidcLogoutHandler(final ReactiveClientRegistrationRepository repository) {
        return new OidcClientInitiatedServerLogoutSuccessHandler(repository);
    }

    private Optional<OAuthUserHandler<OidcUser, OidcUserRequest>> getOidcUserHandler(final String providerId) {
        final String provider = getProviderByProviderId(providerId);
        return oidcUserHandlers.stream()
            .filter(h -> h.shouldHandle(provider))
            .findFirst();
    }

    private Optional<OAuthUserHandler<OAuth2User, OAuth2UserRequest>> getOAuthUserHandler(final String providerId) {
        final String provider = getProviderByProviderId(providerId);
        return oauthUserHandlers.stream()
            .filter(h -> h.shouldHandle(provider))
            .findFirst();
    }

    private String getProviderByProviderId(final String providerId) {
        return properties.getClient().get(providerId).getProvider();
    }

    private static class LoginPageFilter implements WebFilter {
        private static final String CLIENT_REGISTRATION_IMAGE_SOURCE = "/img/%s.png";
        private static final String CLIENT_REGISTRATION_HREF = "/oauth2/authorization/%s";

        private final ServerWebExchangeMatcher matcher = pathMatchers(HttpMethod.GET, "/login");

        private final TemplateEngine templateEngine;
        private final List<ClientRegistrationModel> clientRegistrations;
        private final ODDOAuth2Properties oddoAuth2Properties;

        public LoginPageFilter(final TemplateEngine templateEngine,
                               final List<ClientRegistration> clientRegistrations,
                               final ODDOAuth2Properties properties) {
            this.templateEngine = templateEngine;
            this.oddoAuth2Properties = properties;
            this.clientRegistrations = clientRegistrations.stream()
                .map(this::mapClientRegistration)
                .toList();
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
            final ODDOAuth2Properties.OAuth2Provider provider =
                oddoAuth2Properties.getClient().get(cr.getRegistrationId());
            return new ClientRegistrationModel(
                StringUtils.defaultIfBlank(cr.getClientName(), cr.getRegistrationId()),
                CLIENT_REGISTRATION_IMAGE_SOURCE.formatted(provider.getProvider().toLowerCase()),
                CLIENT_REGISTRATION_HREF.formatted(cr.getRegistrationId())
            );
        }

        private record ClientRegistrationModel(String name, String imgSrc, String href) {
        }
    }
}
