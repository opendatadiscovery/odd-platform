package org.opendatadiscovery.oddplatform.auth.handler.impl;

import com.nimbusds.jose.shaded.json.JSONArray;
import java.util.HashSet;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.auth.condition.CognitoCondition;
import org.opendatadiscovery.oddplatform.auth.handler.OAuthUserHandler;
import org.opendatadiscovery.oddplatform.auth.mapper.GrantedAuthorityExtractor;
import org.opendatadiscovery.oddplatform.dto.security.UserRole;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${spring.security.oauth2.client.provider.cognito.admin-principals:}")
    private Set<String> adminPrincipals;

    @Value("${spring.security.oauth2.client.provider.cognito.admin-groups:}")
    private Set<String> adminGroups;

    @Override
    public String getProviderId() {
        return "cognito";
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
        if (CollectionUtils.isNotEmpty(adminPrincipals)) {
            final String username = token.getClaim(COGNITO_USERNAME);
            final boolean containsUsername = containsIgnoreCase(adminPrincipals, username);
            if (containsUsername) {
                roles.add(UserRole.ROLE_ADMIN);
            }
        }
        if (CollectionUtils.isNotEmpty(adminGroups)) {
            final JSONArray groups = token.getClaim(COGNITO_GROUPS);
            if (groups != null) {
                final boolean containsGroup = groups.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .anyMatch(g -> containsIgnoreCase(adminGroups, g));
                if (containsGroup) {
                    roles.add(UserRole.ROLE_ADMIN);
                }
            }
        }
        final Set<GrantedAuthority> authorities = authorityExtractor.getAuthoritiesByUserRoles(roles);
        final DefaultOidcUser enrichedUser =
            new DefaultOidcUser(authorities, oidcUser.getIdToken(), oidcUser.getUserInfo(), userNameAttribute);
        return Mono.just(enrichedUser);
    }
}
