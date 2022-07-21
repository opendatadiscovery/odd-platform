package org.opendatadiscovery.oddplatform.notification.processor;

import org.opendatadiscovery.oddplatform.notification.wal.DecodedWALMessage;

public interface NotificationMessageBuilder {
    String build(final DecodedWALMessage message);
}
