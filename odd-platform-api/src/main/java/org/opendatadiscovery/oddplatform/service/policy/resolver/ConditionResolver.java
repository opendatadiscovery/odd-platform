package org.opendatadiscovery.oddplatform.service.policy.resolver;

import org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionDto;

public interface ConditionResolver<T> {
    boolean resolve(final PolicyConditionDto condition, final T context);
}
