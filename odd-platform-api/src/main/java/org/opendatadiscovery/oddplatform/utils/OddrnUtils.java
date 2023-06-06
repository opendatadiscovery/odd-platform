package org.opendatadiscovery.oddplatform.utils;

import lombok.experimental.UtilityClass;

@UtilityClass
public class OddrnUtils {
    public static final String UNKNOWN_DATASOURCE_TYPE = "other";

    public static String transformPrefix(final String prefix) {
        return prefix.replace("//", "").replace("/", "_");
    }

    public static String normalizePrefix(final String prefix) {
        if (UNKNOWN_DATASOURCE_TYPE.equalsIgnoreCase(prefix)) {
            return prefix;
        }
        return "//" + prefix.replace("_", "/");
    }
}
