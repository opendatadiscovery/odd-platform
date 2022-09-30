package org.opendatadiscovery.oddplatform.auth;

import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.security.oauth2.core.AuthorizationGrantType;

public final class ODDOAuth2PropertiesConverter {

    private ODDOAuth2PropertiesConverter() {
    }

    public static OAuth2ClientProperties convertOddProperties(final ODDOAuth2Properties properties) {
        final OAuth2ClientProperties result = new OAuth2ClientProperties();
        properties.getClient().forEach((key, provider) -> {
            final OAuth2ClientProperties.Registration registration = new OAuth2ClientProperties.Registration();
            registration.setClientId(provider.getClientId());
            registration.setClientSecret(provider.getClientSecret());
            if (StringUtils.isNotEmpty(provider.getClientName())) {
                registration.setClientName(provider.getClientName());
            }
            registration.setScope(provider.getScope());
            if (StringUtils.isNotEmpty(provider.getRedirectUri())) {
                registration.setRedirectUri(provider.getRedirectUri());
            }
            registration.setAuthorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE.getValue());
            result.getRegistration().put(key, registration);

            final OAuth2ClientProperties.Provider clientProvider = new OAuth2ClientProperties.Provider();
            if (StringUtils.isNotEmpty(provider.getAuthorizationUri())) {
                clientProvider.setAuthorizationUri(provider.getAuthorizationUri());
            }
            if (StringUtils.isNotEmpty(provider.getIssuerUri())) {
                clientProvider.setIssuerUri(provider.getIssuerUri());
            }
            if (StringUtils.isNotEmpty(provider.getJwkSetUri())) {
                clientProvider.setJwkSetUri(provider.getJwkSetUri());
            }
            if (StringUtils.isNotEmpty(provider.getTokenUri())) {
                clientProvider.setTokenUri(provider.getTokenUri());
            }
            if (StringUtils.isNotEmpty(provider.getUserInfoUri())) {
                clientProvider.setUserInfoUri(provider.getUserInfoUri());
            }
            if (StringUtils.isNotEmpty(provider.getUserNameAttribute())) {
                clientProvider.setUserNameAttribute(provider.getUserNameAttribute());
            }
            result.getProvider().put(key, clientProvider);
        });
        return result;
    }
}
