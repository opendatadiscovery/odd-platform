package org.opendatadiscovery.oddplatform.notification.processor;

import org.opendatadiscovery.oddplatform.notification.dto.DecodedWALMessage;

public interface PostgresWALMessageProcessor {
    void process(final DecodedWALMessage message) throws InterruptedException;
}
