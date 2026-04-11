package org.opendatadiscovery.oddplatform.utils;

import java.util.Collection;

public final class OperationUtils {

    public static boolean containsIgnoreCase(final Collection<String> collection,
                                             final String element) {
        return collection.stream().anyMatch(element::equalsIgnoreCase);
    }
}
