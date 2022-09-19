package org.opendatadiscovery.oddplatform.auth;

import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;

public final class ODDOAuth2PropertiesConverter {

    private ODDOAuth2PropertiesConverter() {
    }

    public static OAuth2ClientProperties convertOddProperties(final ODDOAuth2Properties properties) {
        final OAuth2ClientProperties result = new OAuth2ClientProperties();
        properties.getClient().forEach((key, oAuth2Provider) -> {
            final OAuth2ClientProperties.Registration registration = new OAuth2ClientProperties.Registration();
            registration.setClientId(oAuth2Provider.getClientId());
            registration.setClientSecret(oAuth2Provider.getClientSecret());
            //registration.setProvider(oAuth2Provider.getProvider());
            registration.setClientName(oAuth2Provider.getClientName());
            registration.setScope(oAuth2Provider.getScope());
            registration.setRedirectUri(oAuth2Provider.getRedirectUri());
            result.getRegistration().put(key, registration);

            final OAuth2ClientProperties.Provider provider = new OAuth2ClientProperties.Provider();
            provider.setAuthorizationUri(oAuth2Provider.getAuthorizationUri());
            provider.setIssuerUri(oAuth2Provider.getIssuerUri());
            provider.setJwkSetUri(oAuth2Provider.getJwkSetUri());
            provider.setTokenUri(oAuth2Provider.getTokenUri());
            provider.setUserInfoUri(oAuth2Provider.getUserInfoUri());
            provider.setUserNameAttribute(oAuth2Provider.getUserNameAttribute());
            result.getProvider().put(key, provider);
        });
        return result;
    }
}
