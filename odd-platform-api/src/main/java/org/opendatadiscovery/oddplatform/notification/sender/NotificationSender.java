package org.opendatadiscovery.oddplatform.notification.sender;

import org.opendatadiscovery.oddplatform.notification.dto.NotificationMessage;

public interface NotificationSender<T extends NotificationMessage> {
    void send(final T message);

    String receiverId();
}