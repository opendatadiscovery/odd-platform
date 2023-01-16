package org.opendatadiscovery.oddplatform.auth.handler.impl;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.auth.ODDOAuth2Properties;
import org.opendatadiscovery.oddplatform.auth.Provider;
import org.opendatadiscovery.oddplatform.auth.condition.AzureCondition;
import org.opendatadiscovery.oddplatform.auth.handler.OAuthUserHandler;
import org.opendatadiscovery.oddplatform.auth.mapper.GrantedAuthorityExtractor;
import org.springframework.context.annotation.Conditional;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.utils.OperationUtils.containsIgnoreCase;

@Component
@Conditional(AzureCondition.class)
@RequiredArgsConstructor
public class AzureUserHandler implements OAuthUserHandler<OidcUser, OidcUserRequest> {
    private final String AZURE_LOGIN = "email";
    private final String AZURE_ROLE_ATTRIBUTE = "roles";
    private final ODDOAuth2Properties oAuth2Properties;
    private final GrantedAuthorityExtractor authorityExtractor;

    @Override
    public boolean shouldHandle(final String provider) {
        return StringUtils.isNotEmpty(provider) && provider.equalsIgnoreCase(Provider.AZURE.name());
    }

    @Override
    public Mono<OidcUser> enrichUserWithProviderInformation(final OidcUser user,
                                                            final OidcUserRequest request) {
        final String registrationId = request.getClientRegistration().getRegistrationId();
        final ODDOAuth2Properties.OAuth2Provider provider = oAuth2Properties.getClient().get(registrationId);
        final String userNameAttributeName = provider.getUserNameAttribute();
        boolean isAdmin = false;

        if (CollectionUtils.isNotEmpty(provider.getAdminPrincipals())) {
            final String adminPrincipalAttribute;
            if (StringUtils.isNotEmpty(provider.getAdminAttribute())) {
                adminPrincipalAttribute = provider.getAdminAttribute();
            } else {
                adminPrincipalAttribute = AZURE_LOGIN;
            }
            final Optional<String> username = Optional.ofNullable(user.getAttribute(adminPrincipalAttribute));
            final boolean containsUsername = username
                .map(name -> containsIgnoreCase(provider.getAdminPrincipals(), name))
                .orElse(false);
            if (containsUsername) {
                isAdmin = true;
            }
        }
        if (CollectionUtils.isNotEmpty(provider.getAzureAdminRoles())) {
            final List<String> roles = user.getAttribute(AZURE_ROLE_ATTRIBUTE);
            final Set<String> adminRoles = provider.getAzureAdminRoles();
            final boolean containsRoles = roles.stream().anyMatch(role -> adminRoles.contains(role));
            if (containsRoles) {
                isAdmin = true;
            }
        }
        final DefaultOidcUser enrichedUser =
            new DefaultOidcUser(authorityExtractor.getAuthorities(isAdmin),
                user.getIdToken(),
                user.getUserInfo(),
                userNameAttributeName);
        return Mono.just(enrichedUser);
    }
}
