package org.opendatadiscovery.oddplatform.auth.handler.impl;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.auth.condition.GoogleCondition;
import org.opendatadiscovery.oddplatform.auth.handler.OAuthUserHandler;
import org.opendatadiscovery.oddplatform.auth.mapper.GrantedAuthorityExtractor;
import org.opendatadiscovery.oddplatform.dto.security.UserRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientPropertiesRegistrationAdapter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.utils.OperationUtils.containsIgnoreCase;

@Component
@Conditional(GoogleCondition.class)
@RequiredArgsConstructor
public class GoogleUserHandler implements OAuthUserHandler<OidcUser, OidcUserRequest> {
    private static final String GOOGLE_EMAIL = "email";
    private static final String GOOGLE_DOMAIN = "hd";

    @Value("${spring.security.oauth2.client.provider.google.admin-principals:}")
    private Set<String> adminPrincipals;

    @Value("${spring.security.oauth2.client.provider.google.allowed-domain:}")
    private String allowedDomain;

    private final GrantedAuthorityExtractor authorityExtractor;

    @Override
    public String getProviderId() {
        return "google";
    }

    @Override
    public Mono<OidcUser> enrichUserWithProviderInformation(final OidcUser oidcUser,
                                                            final OidcUserRequest request) {
        final String userNameAttributeName = request.getClientRegistration()
            .getProviderDetails()
            .getUserInfoEndpoint().getUserNameAttributeName();
        final String userNameAttribute = Objects.requireNonNullElse(userNameAttributeName, IdTokenClaimNames.SUB);
        final Set<UserRole> roles = new HashSet<>();
        final OidcIdToken token = oidcUser.getIdToken();
        final String domain = token.getClaim(GOOGLE_DOMAIN);
        if (allowedDomain != null && !StringUtils.equalsIgnoreCase(allowedDomain, domain)) {
            return Mono.error(() -> new OAuth2AuthenticationException(new OAuth2Error("invalid_token",
                String.format("Domain %s doesn't match with allowed domain %s", domain, allowedDomain), "")));
        }
        if (CollectionUtils.isNotEmpty(adminPrincipals)) {
            final String email = token.getClaim(GOOGLE_EMAIL);
            final boolean containsEmail = containsIgnoreCase(adminPrincipals, email);
            if (containsEmail) {
                roles.add(UserRole.ROLE_ADMIN);
            }
        }
        final Set<GrantedAuthority> authorities = authorityExtractor.getAuthoritiesByUserRoles(roles);
        final DefaultOidcUser enrichedUser =
            new DefaultOidcUser(authorities, oidcUser.getIdToken(), oidcUser.getUserInfo(), userNameAttribute);
        return Mono.just(enrichedUser);
    }

    @Bean
    public InMemoryReactiveClientRegistrationRepository clientRegistrationRepository(
        final OAuth2ClientProperties properties) {
        final List<ClientRegistration> registrations = new ArrayList<>(
            OAuth2ClientPropertiesRegistrationAdapter.getClientRegistrations(properties).values());
        if (StringUtils.isNotEmpty(allowedDomain)) {
            final List<ClientRegistration> clientRegistrations = registrations.stream()
                .map(cr -> {
                    if (cr.getRegistrationId().equalsIgnoreCase(CommonOAuth2Provider.GOOGLE.name())) {
                        final String newUri = cr.getProviderDetails().getAuthorizationUri() + "?hd=" + allowedDomain;
                        return ClientRegistration.withClientRegistration(cr).authorizationUri(newUri).build();
                    } else {
                        return cr;
                    }
                }).toList();
            return new InMemoryReactiveClientRegistrationRepository(clientRegistrations);
        }
        return new InMemoryReactiveClientRegistrationRepository(registrations);
    }
}
