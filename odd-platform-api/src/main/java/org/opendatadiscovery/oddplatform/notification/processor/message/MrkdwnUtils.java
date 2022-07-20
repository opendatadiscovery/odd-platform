package org.opendatadiscovery.oddplatform.notification.processor.message;

import lombok.experimental.UtilityClass;

@UtilityClass
public class MrkdwnUtils {
    public static String bold(final String text) {
        return String.format("*%s*", text);
    }

    public static String buildLink(final String text, final String url) {
        return String.format("<%s|%s>", url, text);
    }
}