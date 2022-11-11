package org.opendatadiscovery.oddplatform.notification.config;

import org.opendatadiscovery.oddplatform.service.feature.FeatureResolver;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

public class NotificationsFeatureCondition implements Condition {
    @Override
    public boolean matches(final ConditionContext context, final AnnotatedTypeMetadata metadata) {
        return context
            .getEnvironment()
            .getProperty(FeatureResolver.NOTIFICATIONS_ENABLED_PROPERTY, Boolean.class, false);
    }
}
