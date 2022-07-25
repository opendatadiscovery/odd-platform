package org.opendatadiscovery.oddplatform.notification.exception;

public class NotificationSubscriberException extends RuntimeException {
    public NotificationSubscriberException(final String message) {
        super(message);
    }

    public NotificationSubscriberException(final String message, final Throwable cause) {
        super(message, cause);
    }

    public NotificationSubscriberException(final Throwable cause) {
        super(cause);
    }
}
