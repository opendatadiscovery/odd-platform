package org.opendatadiscovery.oddplatform.auth;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import javax.annotation.PostConstruct;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

@ConfigurationProperties("auth.oauth2")
@Data
public class ODDOAuth2Properties {
    private Map<String, OAuth2Provider> client = new HashMap<>();

    @PostConstruct
    public void validate() {
        getClient().values().forEach(this::validateProvider);
    }

    private void validateProvider(final OAuth2Provider provider) {
        if (!StringUtils.hasText(provider.getClientId())) {
            throw new IllegalStateException("Client id must not be empty.");
        }
        if (!StringUtils.hasText(provider.getProvider())) {
            throw new IllegalStateException("Provider must not be empty");
        }
    }

    @Data
    public static class OAuth2Provider {
        private String provider;
        private String clientId;
        private String clientSecret;
        private String clientName;
        private String redirectUri;
        private Set<String> scope;
        private String issuerUri;
        private String authorizationUri;
        private String tokenUri;
        private String userInfoUri;
        private String jwkSetUri;
        private String logoutUri;
        private String userNameAttribute;
        private String adminAttribute;
        private Set<String> adminGroups;
        private Set<String> adminPrincipals;
        private String organizationName;
        private String allowedDomain;
    }
}
