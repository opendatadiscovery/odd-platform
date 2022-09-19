package org.opendatadiscovery.oddplatform.auth;

import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;

public final class ODDOAuth2PropertiesConverter {

    private ODDOAuth2PropertiesConverter() {
    }

    public static OAuth2ClientProperties convertOddProperties(final ODDOAuth2Properties properties) {
        final OAuth2ClientProperties result = new OAuth2ClientProperties();
        properties.getClient().forEach((key, provider) -> {
            final OAuth2ClientProperties.Registration registration = new OAuth2ClientProperties.Registration();
            registration.setClientId(provider.getClientId());
            registration.setClientSecret(provider.getClientSecret());
            registration.setClientName(provider.getClientName());
            registration.setScope(provider.getScope());
            registration.setRedirectUri(provider.getRedirectUri());
            result.getRegistration().put(key, registration);

            final OAuth2ClientProperties.Provider clientProvider = new OAuth2ClientProperties.Provider();
            clientProvider.setAuthorizationUri(provider.getAuthorizationUri());
            clientProvider.setIssuerUri(provider.getIssuerUri());
            clientProvider.setJwkSetUri(provider.getJwkSetUri());
            clientProvider.setTokenUri(provider.getTokenUri());
            clientProvider.setUserInfoUri(provider.getUserInfoUri());
            clientProvider.setUserNameAttribute(provider.getUserNameAttribute());
            result.getProvider().put(key, clientProvider);
        });
        return result;
    }
}
