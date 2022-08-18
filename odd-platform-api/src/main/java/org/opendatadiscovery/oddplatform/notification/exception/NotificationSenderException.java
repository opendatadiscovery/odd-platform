package org.opendatadiscovery.oddplatform.notification.exception;

import lombok.Getter;

@Getter
public class NotificationSenderException extends Exception {
    private final String notificationReceiverId;

    public NotificationSenderException(final String message,
                                       final String notificationReceiverId) {
        super(message);

        this.notificationReceiverId = notificationReceiverId;
    }

    public NotificationSenderException(final String message,
                                       final String notificationReceiverId,
                                       final Throwable t) {
        super(message, t);

        this.notificationReceiverId = notificationReceiverId;
    }

    @Override
    public String getMessage() {
        return String.format("Notification sender %s: %s", notificationReceiverId, super.getMessage());
    }
}
