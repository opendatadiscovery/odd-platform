package org.opendatadiscovery.oddplatform.notification.dto;

import java.util.Map;

public record DecodedWALMessage(int relationId, Operation operation, Map<String, Column> columns) {
    public enum Operation {
        INSERT,
        UPDATE,
    }

    public record Column(String name, String type, String valueAsString) {
    }

    public String getColumnValue(final String columnName) {
        final Column column = this.columns.get(columnName);

        if (column == null) {
            throw new IllegalArgumentException("Column %s has not been found".formatted(columnName));
        }

        return column.valueAsString();
    }
}