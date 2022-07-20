package org.opendatadiscovery.oddplatform.notification.processor;

import java.io.NotSerializableException;
import org.opendatadiscovery.oddplatform.notification.dto.DecodedWALMessage;
import org.opendatadiscovery.oddplatform.notification.exception.NotificationSenderException;

public interface PostgresWALMessageProcessor {
    void process(final DecodedWALMessage message)
        throws InterruptedException, NotificationSenderException, NotSerializableException;
}
