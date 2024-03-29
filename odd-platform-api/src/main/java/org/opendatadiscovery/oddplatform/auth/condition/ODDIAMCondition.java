package org.opendatadiscovery.oddplatform.auth.condition;

import org.opendatadiscovery.oddplatform.utils.OperationUtils;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

import static org.opendatadiscovery.oddplatform.auth.Provider.ODD_IAM;

public class ODDIAMCondition extends AbstractProviderCondition implements Condition {
    @Override
    public boolean matches(final ConditionContext context, final AnnotatedTypeMetadata metadata) {
        return OperationUtils.containsIgnoreCase(getRegisteredProviders(context.getEnvironment()), ODD_IAM.name());
    }
}
