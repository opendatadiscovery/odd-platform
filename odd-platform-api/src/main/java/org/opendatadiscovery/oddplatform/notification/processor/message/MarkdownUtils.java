package org.opendatadiscovery.oddplatform.notification.processor.message;

public class MarkdownUtils {
    private MarkdownUtils() {
    }

    public static String bold(final String text) {
        return String.format("*%s*", text);
    }

    public static String italic(final String text) {
        return String.format("_%s_", text);
    }

    public static String buildLink(final String text, final String url) {
        return String.format("<%s|%s>", url, text);
    }
}