package org.opendatadiscovery.oddplatform.notification.sender;

import org.opendatadiscovery.oddplatform.notification.dto.NotificationMessage;
import org.opendatadiscovery.oddplatform.notification.exception.NotificationSenderException;

public interface NotificationSender<T extends NotificationMessage> {
    void send(final T message) throws InterruptedException, NotificationSenderException;

    String receiverId();
}