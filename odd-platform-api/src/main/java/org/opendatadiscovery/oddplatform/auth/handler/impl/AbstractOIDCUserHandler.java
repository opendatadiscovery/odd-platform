package org.opendatadiscovery.oddplatform.auth.handler.impl;

import com.nimbusds.jose.shaded.json.JSONArray;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.auth.ODDOAuth2Properties;
import org.opendatadiscovery.oddplatform.auth.handler.OAuthUserHandler;
import org.opendatadiscovery.oddplatform.auth.mapper.GrantedAuthorityExtractor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.utils.OperationUtils.containsIgnoreCase;

@RequiredArgsConstructor
public abstract class AbstractOIDCUserHandler implements OAuthUserHandler<OidcUser, OidcUserRequest> {
    private final ODDOAuth2Properties oAuth2Properties;
    private final GrantedAuthorityExtractor authorityExtractor;

    @Override
    public Mono<OidcUser> enrichUserWithProviderInformation(final OidcUser oidcUser, final OidcUserRequest request) {
        final String registrationId = request.getClientRegistration().getRegistrationId();
        final ODDOAuth2Properties.OAuth2Provider provider = oAuth2Properties.getClient().get(registrationId);
        final String userNameAttributeName = provider.getUserNameAttribute();
        final String userNameAttribute =
            Objects.requireNonNullElse(userNameAttributeName, getDefaultUsernameAttribute());
        boolean isAdmin = false;
        if (CollectionUtils.isNotEmpty(provider.getAdminPrincipals())) {
            final String adminPrincipalAttribute = StringUtils.isNotEmpty(provider.getAdminAttribute())
                ? provider.getAdminAttribute() : userNameAttributeName;
            final String adminAttribute = oidcUser.getAttribute(adminPrincipalAttribute);
            final boolean containsUsername;
            if (adminAttribute != null) {
                containsUsername = containsIgnoreCase(provider.getAdminPrincipals(), adminAttribute);
                if (containsUsername) {
                    isAdmin = true;
                }
            }
        }
        final String groupsClaim = StringUtils.isNotEmpty(provider.getGroupsClaim())
            ? provider.getGroupsClaim() : getDefaultGroupsClaim();
        if (StringUtils.isNotEmpty(groupsClaim) && CollectionUtils.isNotEmpty(provider.getAdminGroups())) {
            final JSONArray groups = oidcUser.getAttribute(groupsClaim);
            if (groups != null) {
                final boolean containsGroup = groups.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .anyMatch(g -> containsIgnoreCase(provider.getAdminGroups(), g));
                if (containsGroup) {
                    isAdmin = true;
                }
            }
        }
        final Set<GrantedAuthority> authorities = authorityExtractor.getAuthorities(isAdmin);
        final DefaultOidcUser enrichedUser =
            new DefaultOidcUser(authorities, oidcUser.getIdToken(), oidcUser.getUserInfo(), userNameAttribute);
        return Mono.just(enrichedUser);
    }

    protected abstract String getDefaultUsernameAttribute();

    protected abstract String getDefaultGroupsClaim();
}
