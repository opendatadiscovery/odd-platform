package org.opendatadiscovery.oddplatform.utils;

import java.util.function.Function;

public class MappingUtils {
    public static <T, S> S extractFieldFromNullableObject(final T object, final Function<T, S> mapper) {
        if (object == null) {
            return null;
        }
        return mapper.apply(object);
    }
}
