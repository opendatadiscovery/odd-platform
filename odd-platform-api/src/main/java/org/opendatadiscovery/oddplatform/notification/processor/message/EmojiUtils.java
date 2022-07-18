package org.opendatadiscovery.oddplatform.notification.processor.message;

public class EmojiUtils {
    private EmojiUtils() {
    }

    public static String exclamationEmoji(final String text) {
        return String.format(":exclamation: %s", text);
    }

    public static String userEmoji(final String text) {
        return String.format(":bust_in_silhouette: %s", text);
    }

    public static String linkEmoji(final String text) {
        return String.format(":link: %s", text);
    }
}
