package org.opendatadiscovery.oddplatform.auth.handler.impl;

import com.nimbusds.jose.shaded.json.JSONArray;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.auth.ODDOAuth2Properties;
import org.opendatadiscovery.oddplatform.auth.Provider;
import org.opendatadiscovery.oddplatform.auth.condition.CognitoCondition;
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
@Conditional(CognitoCondition.class)
@RequiredArgsConstructor
public class CognitoUserHandler implements OAuthUserHandler<OidcUser, OidcUserRequest> {
    private static final String COGNITO_USERNAME = "cognito:username";
    private static final String COGNITO_GROUPS = "cognito:groups";
    private final GrantedAuthorityExtractor authorityExtractor;
    private final ODDOAuth2Properties oAuth2Properties;

    @Override
    public boolean shouldHandle(final String provider) {
        return StringUtils.isNotEmpty(provider) && provider.equalsIgnoreCase(Provider.COGNITO.name());
    }

    @Override
    public Mono<OidcUser> enrichUserWithProviderInformation(final OidcUser oidcUser,
                                                            final OidcUserRequest request) {
        final String registrationId = request.getClientRegistration().getRegistrationId();
        final ODDOAuth2Properties.OAuth2Provider provider = oAuth2Properties.getClient().get(registrationId);
        final Set<UserRole> roles = new HashSet<>();
        final OidcIdToken token = oidcUser.getIdToken();
        if (CollectionUtils.isNotEmpty(provider.getAdminPrincipals())) {
            final String adminPrincipalAttribute = StringUtils.isNotEmpty(provider.getAdminAttribute())
                ? provider.getAdminAttribute() : COGNITO_USERNAME;
            final String username = token.getClaim(adminPrincipalAttribute);
            final boolean containsUsername = containsIgnoreCase(provider.getAdminPrincipals(), username);
            if (containsUsername) {
                roles.add(UserRole.ROLE_ADMIN);
            }
        }
        if (CollectionUtils.isNotEmpty(provider.getAdminGroups())) {
            final JSONArray groups = token.getClaim(COGNITO_GROUPS);
            if (groups != null) {
                final boolean containsGroup = groups.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .anyMatch(g -> containsIgnoreCase(provider.getAdminGroups(), g));
                if (containsGroup) {
                    roles.add(UserRole.ROLE_ADMIN);
                }
            }
        }
        final Set<GrantedAuthority> authorities = authorityExtractor.getAuthoritiesByUserRoles(roles);
        final String userNameAttributeName = provider.getUserNameAttribute();
        final String userNameAttribute = Objects.requireNonNullElse(userNameAttributeName, COGNITO_USERNAME);
        final DefaultOidcUser enrichedUser =
            new DefaultOidcUser(authorities, oidcUser.getIdToken(), oidcUser.getUserInfo(), userNameAttribute);
        return Mono.just(enrichedUser);
    }
}
