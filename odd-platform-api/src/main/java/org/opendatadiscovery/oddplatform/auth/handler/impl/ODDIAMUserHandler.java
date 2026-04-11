package org.opendatadiscovery.oddplatform.auth.handler.impl;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.auth.ODDOAuth2Properties;
import org.opendatadiscovery.oddplatform.auth.Provider;
import org.opendatadiscovery.oddplatform.auth.condition.ODDIAMCondition;
import org.opendatadiscovery.oddplatform.auth.handler.OAuthUserHandler;
import org.opendatadiscovery.oddplatform.auth.mapper.GrantedAuthorityExtractor;
import org.springframework.context.annotation.Conditional;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@Conditional(ODDIAMCondition.class)
@RequiredArgsConstructor
public class ODDIAMUserHandler implements OAuthUserHandler<OAuth2User, OAuth2UserRequest> {
    private static final String DEFAULT_IS_ADMIN_ATTRIBUTE = "is_admin";

    private final GrantedAuthorityExtractor grantedAuthorityExtractor;
    private final ODDOAuth2Properties oAuth2Properties;

    @Override
    public boolean shouldHandle(final String provider) {
        return StringUtils.isNotEmpty(provider) && provider.equalsIgnoreCase(Provider.ODD_IAM.name());
    }

    @Override
    public Mono<OAuth2User> enrichUserWithProviderInformation(final OAuth2User user,
                                                              final OAuth2UserRequest request) {
        final String registrationId = request.getClientRegistration().getRegistrationId();
        final ODDOAuth2Properties.OAuth2Provider provider = oAuth2Properties.getClient().get(registrationId);
        final String adminUserInfoFlag = provider.getAdminUserInfoFlag() != null
            ? provider.getAdminUserInfoFlag()
            : DEFAULT_IS_ADMIN_ATTRIBUTE;

        final boolean isAdmin = (boolean) user.getAttributes().getOrDefault(adminUserInfoFlag, false);

        return Mono.just(new DefaultOAuth2User(grantedAuthorityExtractor.getAuthorities(isAdmin),
            user.getAttributes(),
            provider.getUserNameAttribute()));
    }
}

