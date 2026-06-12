package org.opendatadiscovery.oddplatform.utils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.opendatadiscovery.oddplatform.auth.ODDOAuth2Properties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class ProviderUtils {
    @Autowired
    Environment environment;

    private static final Bindable<Map<String, ODDOAuth2Properties.OAuth2Provider>> OAUTH2_PROPERTIES = Bindable
        .mapOf(String.class, ODDOAuth2Properties.OAuth2Provider.class);

    public List<String> getRegisteredProviders() {
        final Map<String, ODDOAuth2Properties.OAuth2Provider> properties = Binder.get(environment)
            .bind("auth.oauth2.client", OAUTH2_PROPERTIES)
            .orElse(Map.of());
        return properties.values().stream()
            .map(ODDOAuth2Properties.OAuth2Provider::getProvider)
            .collect(Collectors.toList());
    }
}
