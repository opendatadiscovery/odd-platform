package org.opendatadiscovery.oddplatform.service.policy.resolver;

import org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionDto;
import org.springframework.stereotype.Component;

@Component
public class NoContextConditionResolver implements ConditionResolver<Void> {
    @Override
    public boolean resolve(final PolicyConditionDto condition, final Void context) {
        return true;
    }
}
