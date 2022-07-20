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
}
