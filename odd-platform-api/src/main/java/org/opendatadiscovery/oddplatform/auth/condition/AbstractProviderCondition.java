package org.opendatadiscovery.oddplatform.auth.condition;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.opendatadiscovery.oddplatform.auth.ODDOAuth2Properties;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.core.env.Environment;

public abstract class AbstractProviderCondition {
    private static final Bindable<Map<String, ODDOAuth2Properties.OAuth2Provider>> OAUTH2_PROPERTIES = Bindable
        .mapOf(String.class, ODDOAuth2Properties.OAuth2Provider.class);

    protected Set<String> getRegisteredProviders(final Environment env) {
        final Map<String, ODDOAuth2Properties.OAuth2Provider> properties = Binder.get(env)
            .bind("auth.oauth2.client", OAUTH2_PROPERTIES)
            .orElse(Map.of());
        return properties.values().stream()
            .map(ODDOAuth2Properties.OAuth2Provider::getProvider)
            .collect(Collectors.toSet());
    }
}
