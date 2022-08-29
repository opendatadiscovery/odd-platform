package org.opendatadiscovery.oddplatform.auth.condition;

import org.apache.commons.lang3.StringUtils;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

public class GoogleCondition implements Condition {
    @Override
    public boolean matches(final ConditionContext context, final AnnotatedTypeMetadata metadata) {
        final String cognitoClientId = "spring.security.oauth2.client.registration.google.client-id";
        return StringUtils.isNotEmpty(context.getEnvironment().getProperty(cognitoClientId));
    }
}