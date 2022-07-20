package org.opendatadiscovery.oddplatform.notification.processor.message;

import lombok.experimental.UtilityClass;

@UtilityClass
public class SlackEmojiUtils {
    public static String exclamationEmoji(final String text) {
        return String.format(":exclamation: %s", text);
    }

    public static String resolvedEmoji(final String text) {
        return String.format(":white_check_mark: %s", text);
    }

    public static String userEmoji(final String text) {
        return String.format(":bust_in_silhouette: %s", text);
    }

    public static String linkEmoji(final String text) {
        return String.format(":link: %s", text);
    }
}
