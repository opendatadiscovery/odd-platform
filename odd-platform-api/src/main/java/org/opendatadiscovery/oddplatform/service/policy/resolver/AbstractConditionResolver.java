package org.opendatadiscovery.oddplatform.service.policy.resolver;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionUnaryDto;
import org.opendatadiscovery.oddplatform.service.policy.comparer.Comparer;

public abstract class AbstractConditionResolver<T> implements ConditionResolver<T> {
    protected abstract Map<PolicyConditionKeyDto, Comparer<T>> getFieldExtractorMap();

    @Override
    public boolean resolve(final PolicyConditionDto condition, final T context) {
        if (condition == null) {
            return true;
        }
        if (condition.getAll() != null) {
            return resolveAll(condition.getAll(), context);
        } else if (condition.getAny() != null) {
            return resolveAny(condition.getAny(), context);
        } else if (condition.getEq() != null) {
            final Map.Entry<PolicyConditionKeyDto, Object> entry = getUnaryCondition(condition.getEq());
            return resolveEquals(entry.getKey(), entry.getValue().toString(), context);
        } else if (condition.getNotEq() != null) {
            final Map.Entry<PolicyConditionKeyDto, Object> entry = getUnaryCondition(condition.getNotEq());
            return resolveNotEquals(entry.getKey(), entry.getValue().toString(), context);
        } else if (condition.getMatch() != null) {
            final Map.Entry<PolicyConditionKeyDto, Object> entry = getUnaryCondition(condition.getMatch());
            return resolveMatch(entry.getKey(), (String) entry.getValue(), context);
        } else if (condition.getNotMatch() != null) {
            final Map.Entry<PolicyConditionKeyDto, Object> entry = getUnaryCondition(condition.getNotMatch());
            return resolveNotMatch(entry.getKey(), (String) entry.getValue(), context);
        } else if (condition.getIs() != null) {
            return resolveIs(condition.getIs(), context);
        } else if (condition.getNotIs() != null) {
            return resolveNotIs(condition.getNotIs(), context);
        } else {
            throw new IllegalArgumentException("Unknown condition type");
        }
    }

    private boolean resolveAll(final List<PolicyConditionDto> conditions, final T context) {
        for (final PolicyConditionDto condition : conditions) {
            if (!resolve(condition, context)) {
                return false;
            }
        }
        return true;
    }

    private boolean resolveAny(final List<PolicyConditionDto> conditions, final T context) {
        for (final PolicyConditionDto condition : conditions) {
            if (resolve(condition, context)) {
                return true;
            }
        }
        return false;
    }

    private boolean resolveMatch(final PolicyConditionKeyDto key, final String value,
                                 final T context) {
        return Optional.ofNullable(getFieldExtractorMap().get(key))
            .map(comparor -> comparor.match(value, context))
            .orElse(false);
    }

    private boolean resolveNotMatch(final PolicyConditionKeyDto key, final String value, final T context) {
        return !resolveMatch(key, value, context);
    }

    private boolean resolveEquals(final PolicyConditionKeyDto key, final String value, final T context) {
        return Optional.ofNullable(getFieldExtractorMap().get(key))
            .map(comparor -> comparor.equals(value, context))
            .orElse(false);
    }

    private boolean resolveNotEquals(final PolicyConditionKeyDto key, final String value, final T context) {
        return !resolveEquals(key, value, context);
    }

    private boolean resolveIs(final PolicyConditionKeyDto key, final T context) {
        return Optional.ofNullable(getFieldExtractorMap().get(key))
            .map(comparor -> comparor.is(context))
            .orElse(false);
    }

    private boolean resolveNotIs(final PolicyConditionKeyDto key, final T context) {
        return !resolveIs(key, context);
    }

    private Map.Entry<PolicyConditionKeyDto, Object> getUnaryCondition(final PolicyConditionUnaryDto unaryDto) {
        return unaryDto.getCondition().entrySet().iterator().next();
    }
}
