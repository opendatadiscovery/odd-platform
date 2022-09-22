package org.opendatadiscovery.oddplatform.auth.handler.impl;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.auth.ODDOAuth2Properties;
import org.opendatadiscovery.oddplatform.auth.Provider;
import org.opendatadiscovery.oddplatform.auth.condition.GoogleCondition;
import org.opendatadiscovery.oddplatform.auth.handler.OAuthUserHandler;
import org.opendatadiscovery.oddplatform.auth.mapper.GrantedAuthorityExtractor;
import org.opendatadiscovery.oddplatform.dto.security.UserRole;
import org.springframework.context.annotation.Conditional;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
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

    private final GrantedAuthorityExtractor authorityExtractor;
    private final ODDOAuth2Properties oAuth2Properties;

    @Override
    public boolean shouldHandle(final String provider) {
        return StringUtils.isNotEmpty(provider) && provider.equalsIgnoreCase(Provider.GOOGLE.name());
    }

    @Override
    public Mono<OidcUser> enrichUserWithProviderInformation(final OidcUser oidcUser,
                                                            final OidcUserRequest request) {
        final String registrationId = request.getClientRegistration().getRegistrationId();
        final ODDOAuth2Properties.OAuth2Provider provider = oAuth2Properties.getClient().get(registrationId);
        final Set<UserRole> roles = new HashSet<>();
        final OidcIdToken token = oidcUser.getIdToken();
        final String domain = token.getClaim(GOOGLE_DOMAIN);
        if (StringUtils.isNotEmpty(provider.getAllowedDomain())
            && !StringUtils.equalsIgnoreCase(provider.getAllowedDomain(), domain)) {
            return Mono.error(() -> new OAuth2AuthenticationException(new OAuth2Error("invalid_token",
                String.format("Domain %s doesn't match with allowed domain %s", domain, provider.getAllowedDomain()),
                "")));
        }
        if (CollectionUtils.isNotEmpty(provider.getAdminPrincipals())) {
            final String adminPrincipalAttribute = StringUtils.isNotEmpty(provider.getAdminAttribute())
                ? provider.getAdminAttribute() : GOOGLE_EMAIL;
            final String adminPrincipal = token.getClaim(adminPrincipalAttribute);
            final boolean containsEmail = containsIgnoreCase(provider.getAdminPrincipals(), adminPrincipal);
            if (containsEmail) {
                roles.add(UserRole.ROLE_ADMIN);
            }
        }
        final Set<GrantedAuthority> authorities = authorityExtractor.getAuthoritiesByUserRoles(roles);
        final String userNameAttributeName = request.getClientRegistration()
            .getProviderDetails()
            .getUserInfoEndpoint().getUserNameAttributeName();
        final String userNameAttribute = Objects.requireNonNullElse(userNameAttributeName, IdTokenClaimNames.SUB);
        final DefaultOidcUser enrichedUser =
            new DefaultOidcUser(authorities, oidcUser.getIdToken(), oidcUser.getUserInfo(), userNameAttribute);
        return Mono.just(enrichedUser);
    }
}
