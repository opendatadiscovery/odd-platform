package org.opendatadiscovery.oddplatform.service.policy.comparer;

import java.util.function.Function;

public class SimpleFieldComparer<T> implements Comparer<T> {
    private final Function<T, String> fieldExtractor;
    private final Function<T, Boolean> fieldEvaluator;

    public SimpleFieldComparer(final Function<T, String> fieldExtractor) {
        this(fieldExtractor, (T context) -> Boolean.TRUE.toString().equals(fieldExtractor.apply(context)));
    }

    public SimpleFieldComparer(final Function<T, String> fieldExtractor,
                               final Function<T, Boolean> fieldEvaluator) {
        this.fieldExtractor = fieldExtractor;
        this.fieldEvaluator = fieldEvaluator;
    }

    @Override
    public boolean match(final String value, final T context) {
        return value.matches(fieldExtractor.apply(context));
    }

    @Override
    public boolean equals(final String value, final  T context) {
        return value.equals(fieldExtractor.apply(context));
    }

    @Override
    public boolean is(final T context) {
        return fieldEvaluator.apply(context);
    }
}
