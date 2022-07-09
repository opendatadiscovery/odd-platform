package org.opendatadiscovery.oddplatform.notification.wal;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.notification.PGConnectionFactory;
import org.opendatadiscovery.oddplatform.notification.wal.DecodedWALMessage.Column;
import org.opendatadiscovery.oddplatform.notification.wal.DecodedWALMessage.Operation;
import org.springframework.stereotype.Component;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.collectingAndThen;
import static java.util.stream.Collectors.toMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class PostgresWALMessageDecoder {
    private static final int COLUMN_NAME_ID = 4;
    private static final int COLUMN_TYPE_ID = 6;

    // Value list should be an ordered one to preserve column order coming from RELATION messages
    private final Map<Integer, List<ColumnMeta>> tableColumns = new HashMap<>();

    private final PGConnectionFactory pgConnectionFactory;

    // Returns DecodedWALMessage in case of INSERT and UPDATE messages, otherwise returns empty Optional
    public Optional<DecodedWALMessage> decode(final ByteBuffer buffer) {
        final MessageType messageType = MessageType.forType((char) buffer.get());

        log.debug("Received message type {}", messageType);

        switch (messageType) {
            case RELATION:
                handleRelationMessage(buffer);
                return Optional.empty();
            case INSERT:
                return Optional.of(decodeInsertMessage(buffer));
            case UPDATE:
                return Optional.of(decodeUpdateMessage(buffer));
            default:
                return Optional.empty();
        }
    }

    private void handleRelationMessage(final ByteBuffer buffer) {
        try (final Connection metadataConnection = pgConnectionFactory.getConnection()) {
            final int relationId = buffer.getInt();
            final String schemaName = readString(buffer);
            final String tableName = readString(buffer);
            // skipping replica identity id for redundancy
            buffer.get();
            final short columnCount = buffer.getShort();

            log.debug("Event: {}, RelationId: {}, Columns: {}", MessageType.RELATION, relationId, columnCount);
            log.debug("Schema: '{}', Table: '{}'", schemaName, tableName);

            final DatabaseMetaData databaseMetadata = metadataConnection.getMetaData();
            final List<ColumnMeta> columns = new LinkedList<>();

            try (final ResultSet rs = databaseMetadata.getColumns(null, schemaName, tableName, null)) {
                while (rs.next()) {
                    final String name = rs.getString(COLUMN_NAME_ID);
                    final String type = rs.getString(COLUMN_TYPE_ID);

                    columns.add(new ColumnMeta(name, type));
                }
            }
            tableColumns.put(relationId, columns);
        } catch (final Exception e) {
            log.error("Error occurred while handling RELATION message: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    private DecodedWALMessage decodeInsertMessage(final ByteBuffer buffer) {
        final int relationId = buffer.getInt();

        // Skipping tuple type char.
        // Must be "N" for inserts
        buffer.get();

        final List<ColumnMeta> columnMeta = tableColumns.get(relationId);
        if (columnMeta == null) {
            throw new RuntimeException("No column meta for relation ID %d".formatted(relationId));
        }

        return readTupleDataForColumns(buffer, columnMeta)
            .stream()
            .collect(collectingAndThen(
                toMap(Column::name, identity()),
                columns -> new DecodedWALMessage(relationId, Operation.INSERT, columns)
            ));
    }

    private DecodedWALMessage decodeUpdateMessage(final ByteBuffer buffer) {
        final int relationId = buffer.getInt();

        final char tupleType = (char) buffer.get();

        final List<ColumnMeta> columnMeta = tableColumns.get(relationId);

        if (columnMeta == null) {
            throw new RuntimeException("No column meta for relation ID %d".formatted(relationId));
        }

        // K = Identifies the following TupleData submessage as a key
        // O = Identifies the following TupleData submessage as an old tuple
        // Skipping as we don't need old tuple data at the moment
        if ('O' == tupleType || 'K' == tupleType) {
            skipColumnTupleData(buffer);

            // Skipping the 'N' tuple type
            buffer.get();
        }

        return readTupleDataForColumns(buffer, columnMeta)
            .stream()
            .collect(collectingAndThen(
                toMap(Column::name, identity()),
                columns -> new DecodedWALMessage(relationId, Operation.UPDATE, columns)
            ));
    }

    private List<Column> readTupleDataForColumns(final ByteBuffer buffer,
                                                 final List<ColumnMeta> columnMetaList) {
        final List<Column> columns = new ArrayList<>();

        final short numberOfColumns = buffer.getShort();

        for (short i = 0; i < numberOfColumns; ++i) {
            final TupleDataSubMessageType tupleDataSubMessageType =
                TupleDataSubMessageType.forType((char) buffer.get());

            final ColumnMeta columnMeta = columnMetaList.get(i);

            switch (tupleDataSubMessageType) {
                case TEXT ->
                    columns.add(new Column(columnMeta.name(), columnMeta.type(), readColumnValueAsString(buffer)));
                case NULL -> columns.add(new Column(columnMeta.name(), columnMeta.type(), null));
                case UNCHANGED -> log.warn("Column: {}, Value: UNCHANGED", columnMeta.name());
                default -> throw new IllegalArgumentException(
                    "Unknown tuple data sub message type: %s".formatted(tupleDataSubMessageType));
            }
        }

        return columns;
    }

    private void skipColumnTupleData(final ByteBuffer buffer) {
        final short numberOfColumns = buffer.getShort();

        for (short i = 0; i < numberOfColumns; ++i) {
            final TupleDataSubMessageType tupleDataSubMessageType =
                TupleDataSubMessageType.forType((char) buffer.get());

            if (tupleDataSubMessageType == TupleDataSubMessageType.TEXT) {
                readColumnValueAsString(buffer);
            }
        }
    }

    public enum MessageType {
        RELATION,
        BEGIN,
        COMMIT,
        INSERT,
        UPDATE,
        DELETE,
        TYPE,
        ORIGIN,
        TRUNCATE,
        LOGICAL_DECODING_MESSAGE;

        public static MessageType forType(final char type) {
            return switch (type) {
                case 'R' -> RELATION;
                case 'B' -> BEGIN;
                case 'C' -> COMMIT;
                case 'I' -> INSERT;
                case 'U' -> UPDATE;
                case 'D' -> DELETE;
                case 'Y' -> TYPE;
                case 'O' -> ORIGIN;
                case 'T' -> TRUNCATE;
                case 'M' -> LOGICAL_DECODING_MESSAGE;
                default -> throw new IllegalArgumentException("Unsupported message type: " + type);
            };
        }
    }

    public enum TupleDataSubMessageType {
        TEXT,
        UNCHANGED,
        NULL;

        public static TupleDataSubMessageType forType(final char type) {
            return switch (type) {
                case 't' -> TEXT;
                case 'u' -> UNCHANGED;
                case 'n' -> NULL;
                default -> throw new IllegalArgumentException("Unsupported sub-message type: " + type);
            };
        }
    }

    private static String readString(final ByteBuffer buffer) {
        final StringBuilder sb = new StringBuilder();
        byte b;
        while ((b = buffer.get()) != 0) {
            sb.append((char) b);
        }
        return sb.toString();
    }

    private static String readColumnValueAsString(final ByteBuffer buffer) {
        final int length = buffer.getInt();
        final byte[] value = new byte[length];
        buffer.get(value, 0, length);
        return new String(value, StandardCharsets.UTF_8);
    }

    record ColumnMeta(String name, String type) {
    }
}
