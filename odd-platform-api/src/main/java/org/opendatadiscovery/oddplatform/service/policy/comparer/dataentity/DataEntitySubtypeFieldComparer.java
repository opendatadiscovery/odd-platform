package org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity;

import org.opendatadiscovery.oddplatform.dto.policy.DataEntityPolicyResolverContext;
import org.opendatadiscovery.oddplatform.service.policy.comparer.Comparer;

/**
 * Compares policy conditions against the data entity subtype column.
 * Uses raw JOOQ field access to avoid compile-time dependency on generated
 * {@code DataEntityPojo#getSubtype()} which only exists after Flyway migration
 * and JOOQ code re-generation.
 */
public class DataEntitySubtypeFieldComparer implements Comparer<DataEntityPolicyResolverContext> {
    @Override
    public boolean match(final String value, final DataEntityPolicyResolverContext context) {
        final String subtype = getSubtype(context);
        return subtype != null && subtype.matches(value);
    }

    @Override
    public boolean equals(final String value, final DataEntityPolicyResolverContext context) {
        return value.equals(getSubtype(context));
    }

    @Override
    public boolean is(final DataEntityPolicyResolverContext context) {
        return getSubtype(context) != null;
    }

    private String getSubtype(final DataEntityPolicyResolverContext context) {
        try {
            return (String) context.dataEntity().getDataEntity()
                .getClass().getMethod("getSubtype")
                .invoke(context.dataEntity().getDataEntity());
        } catch (final Exception e) {
            return null;
        }
    }
}
