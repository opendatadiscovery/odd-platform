package org.opendatadiscovery.oddplatform.service.policy.comparer;

public interface Comparer<T> {
    boolean match(final String value, final T context);

    boolean equals(final String value, final T context);

    boolean is(final T context);
}
