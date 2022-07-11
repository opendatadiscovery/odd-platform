package org.opendatadiscovery.oddplatform.notification.wal;

import java.util.Map;

public record DecodedWALMessage(int relationId, Operation operation, Map<String, Column> columns) {
    public enum Operation {
        INSERT,
        UPDATE,
    }

    public record Column(String name, String type, String valueAsString) {
    }
}