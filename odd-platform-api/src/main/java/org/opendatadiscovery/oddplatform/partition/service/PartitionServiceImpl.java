package org.opendatadiscovery.oddplatform.partition.service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import static java.time.format.DateTimeFormatter.ISO_LOCAL_DATE;

@Service
public class PartitionServiceImpl implements PartitionService {
    protected static final String DEFAULT_SCHEMA = "public";

    private static final DateTimeFormatter PARTITION_PART_FORMATTER = DateTimeFormatter.BASIC_ISO_DATE;

    @Override
    public Optional<String> getLastPartitionTableName(final Connection connection,
                                                      final String tableName,
                                                      final String schemaName,
                                                      final List<String> tableNameExclusions) throws SQLException {
        final boolean toExclude = CollectionUtils.isNotEmpty(tableNameExclusions);

        final StringBuilder sqlBuilder = new StringBuilder("""
                SELECT table_name FROM information_schema.tables
                WHERE table_schema = ? AND table_name LIKE ?
            """);

        if (toExclude) {
            sqlBuilder.append(" AND table_name NOT IN (?)");
        }

        sqlBuilder.append(" ORDER BY table_name DESC LIMIT 1");

        try (final PreparedStatement statement = connection.prepareStatement(sqlBuilder.toString())) {
            statement.setString(1, StringUtils.isNotEmpty(schemaName) ? schemaName : DEFAULT_SCHEMA);
            statement.setString(2, tableName + "_%");
            if (toExclude) {
                statement.setString(3, String.join(",", tableNameExclusions));
            }
            try (final ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return Optional.of(resultSet.getString("table_name"));
                }
                return Optional.empty();
            }
        }
    }

    @Override
    public String createPartition(final Connection connection,
                                  final String tableName,
                                  final LocalDate beginDate,
                                  final LocalDate endDate) throws SQLException {
        final String partitionName = getPartitionName(tableName, beginDate, endDate);
        final String sql = "CREATE TABLE IF NOT EXISTS %s PARTITION OF %s FOR VALUES FROM ('%s') TO ('%s');"
            .formatted(partitionName, tableName, beginDate.format(ISO_LOCAL_DATE), endDate.format(ISO_LOCAL_DATE));

        try (final PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.execute();
        }

        return partitionName;
    }

    @Override
    public LocalDate getLastPartitionDate(final String tableName) {
        final String[] tableNameParts = tableName.split("_");
        if (tableNameParts.length != 3) {
            throw new IllegalArgumentException("Cannot parse table name: %s".formatted(tableName));
        }

        final String lastPartitionDateString = tableNameParts[tableNameParts.length - 1];
        return LocalDate.parse(lastPartitionDateString, PARTITION_PART_FORMATTER);
    }

    private String getPartitionName(final String tableName, final LocalDate beginDate, final LocalDate endDate) {
        return String.format("%s_%s_%s", tableName, PARTITION_PART_FORMATTER.format(beginDate),
            PARTITION_PART_FORMATTER.format(endDate));
    }
}
