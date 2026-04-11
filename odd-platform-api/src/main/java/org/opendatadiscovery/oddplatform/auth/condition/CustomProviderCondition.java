package org.opendatadiscovery.oddplatform.auth.condition;

import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.opendatadiscovery.oddplatform.auth.Provider;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

public class CustomProviderCondition extends AbstractProviderCondition implements Condition {

    @Override
    public boolean matches(final ConditionContext context, final AnnotatedTypeMetadata metadata) {
        final Set<String> registeredProviders = getRegisteredProviders(context.getEnvironment());
        final Set<String> providers = Stream.of(Provider.values())
            .map(Enum::name)
            .map(String::toLowerCase)
            .collect(Collectors.toSet());
        return registeredProviders.stream().anyMatch(p -> !providers.contains(p));
    }
}
