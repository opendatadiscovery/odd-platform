package org.opendatadiscovery.oddplatform.auth.condition;

import org.springframework.boot.autoconfigure.condition.AnyNestedCondition;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

public class AuthorizationManagerCondition extends AnyNestedCondition {
    public AuthorizationManagerCondition() {
        super(ConfigurationPhase.PARSE_CONFIGURATION);
    }

    @ConditionalOnProperty(name = "auth.type", havingValue = "OAUTH2")
    static class OAuthCondition {
    }

    @ConditionalOnProperty(name = "auth.type", havingValue = "LDAP")
    static class LDAPCondition {
    }
}
