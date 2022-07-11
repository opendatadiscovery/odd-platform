package org.opendatadiscovery.oddplatform.notification.processor;

import org.opendatadiscovery.oddplatform.notification.wal.DecodedWALMessage;

public interface PostgresWALMessageProcessor {
    void process(final DecodedWALMessage message);
}
