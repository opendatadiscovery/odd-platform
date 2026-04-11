package org.opendatadiscovery.oddplatform.service.policy.comparer;

import java.util.List;
import java.util.function.Function;

public class ArrayFieldComparer<T> implements Comparer<T> {
    private final Function<T, List<String>> fieldExtractor;
    private final Function<T, Boolean> fieldEvaluator;

    public ArrayFieldComparer(final Function<T, List<String>> fieldExtractor) {
        this(fieldExtractor, null);
    }

    public ArrayFieldComparer(final Function<T, List<String>> fieldExtractor,
                              final Function<T, Boolean> fieldEvaluator) {
        this.fieldExtractor = fieldExtractor;
        this.fieldEvaluator = fieldEvaluator;
    }

    @Override
    public boolean match(final String value, final T context) {
        return fieldExtractor.apply(context).stream()
            .anyMatch(value::matches);
    }

    @Override
    public boolean equals(final String value, final T context) {
        return fieldExtractor.apply(context).stream()
            .anyMatch(value::equals);
    }

    @Override
    public boolean is(final T context) {
        if (fieldEvaluator != null) {
            return fieldEvaluator.apply(context);
        }
        return false;
    }
}
