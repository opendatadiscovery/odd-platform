package org.opendatadiscovery.oddplatform.auth.handler.impl;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.auth.ODDOAuth2Properties;
import org.opendatadiscovery.oddplatform.auth.Provider;
import org.opendatadiscovery.oddplatform.auth.condition.CustomProviderCondition;
import org.opendatadiscovery.oddplatform.auth.handler.OAuthUserHandler;
import org.opendatadiscovery.oddplatform.auth.mapper.GrantedAuthorityExtractor;
import org.opendatadiscovery.oddplatform.dto.security.UserRole;
import org.springframework.context.annotation.Conditional;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.utils.OperationUtils.containsIgnoreCase;

@Component
@Conditional(CustomProviderCondition.class)
@RequiredArgsConstructor
public class CustomOIDCUserHandler implements OAuthUserHandler<OidcUser, OidcUserRequest> {
    private final ODDOAuth2Properties oAuth2Properties;
    private final GrantedAuthorityExtractor authorityExtractor;

    @Override
    public boolean shouldHandle(final String provider) {
        final Set<String> providers = Arrays.stream(Provider.values())
            .map(Enum::name)
            .map(String::toLowerCase)
            .collect(Collectors.toSet());
        return !providers.contains(provider.toLowerCase());
    }

    @Override
    public Mono<OidcUser> enrichUserWithProviderInformation(final OidcUser oidcUser, final OidcUserRequest request) {
        final String registrationId = request.getClientRegistration().getRegistrationId();
        final ODDOAuth2Properties.OAuth2Provider provider = oAuth2Properties.getClient().get(registrationId);
        final String userNameAttributeName = provider.getUserNameAttribute();
        final String userNameAttribute = Objects.requireNonNullElse(userNameAttributeName, IdTokenClaimNames.SUB);
        final Set<UserRole> roles = new HashSet<>();
        final OidcIdToken token = oidcUser.getIdToken();
        if (StringUtils.isNotEmpty(provider.getAdminAttribute())
            && CollectionUtils.isNotEmpty(provider.getAdminPrincipals())) {
            final String adminAttribute = token.getClaim(provider.getAdminAttribute());
            final boolean containsUsername = containsIgnoreCase(provider.getAdminPrincipals(), adminAttribute);
            if (containsUsername) {
                roles.add(UserRole.ROLE_ADMIN);
            }
        }
        final Set<GrantedAuthority> authorities = authorityExtractor.getAuthoritiesByUserRoles(roles);
        final DefaultOidcUser enrichedUser =
            new DefaultOidcUser(authorities, oidcUser.getIdToken(), oidcUser.getUserInfo(), userNameAttribute);
        return Mono.just(enrichedUser);
    }
}
