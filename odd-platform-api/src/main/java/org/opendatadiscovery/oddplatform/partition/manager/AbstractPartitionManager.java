package org.opendatadiscovery.oddplatform.partition.manager;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import static java.time.format.DateTimeFormatter.ISO_LOCAL_DATE;

@Slf4j
public abstract class AbstractPartitionManager implements PartitionManager {
    protected static final DateTimeFormatter PARTITION_PART_FORMATTER = DateTimeFormatter.BASIC_ISO_DATE;
    protected static final String DEFAULT_SCHEMA = "public";

    @Override
    public void createPartitionsIfNotExists(final Connection connection) {
        final String tableName = getTableName();
        final int partitionDaysPeriod = getPartitionDaysPeriod();

        try {
            final Optional<String> partitionName = getLastPartitionTableName(connection, tableName);
            LocalDate lastPartitionDate;
            if (partitionName.isPresent()) {
                lastPartitionDate = getLastPartitionDate(partitionName.get());
            } else {
                lastPartitionDate = LocalDate.now();
            }
            final LocalDate bufferDate = LocalDate.now().plusDays(partitionDaysPeriod);

            final List<TablePartition> newPartitions = new ArrayList<>();
            while (lastPartitionDate.isBefore(bufferDate)) {
                newPartitions.add(
                    new TablePartition(lastPartitionDate, lastPartitionDate.plusDays(partitionDaysPeriod * 2L))
                );
                lastPartitionDate = lastPartitionDate.plusDays(partitionDaysPeriod);
            }
            for (final TablePartition newPartition : newPartitions) {
                final String createdPartitionName =
                    createPartition(connection, tableName, newPartition.beginDate(), newPartition.endDate());
                log.debug("Created partition for table {} for date range: {} - {}", tableName, newPartition.beginDate(),
                    newPartition.endDate());

                runAdditionalQueriesForPartition(connection, createdPartitionName);
            }
        } catch (final Exception e) {
            throw new RuntimeException(e);
        }
    }

    protected Optional<String> getLastPartitionTableName(final Connection connection,
                                                         final String tableName) throws SQLException {
        return getLastPartitionTableName(connection, tableName, null);
    }

    protected Optional<String> getLastPartitionTableName(final Connection connection,
                                                         final String tableName,
                                                         final String schemaName) throws SQLException {
        final List<String> tableNameExclusions = getTableNameExclusions();
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

    protected String createPartition(final Connection connection,
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

    protected String getPartitionName(final String tableName, final LocalDate beginDate, final LocalDate endDate) {
        return String.format("%s_%s_%s", tableName, PARTITION_PART_FORMATTER.format(beginDate),
            PARTITION_PART_FORMATTER.format(endDate));
    }

    protected LocalDate getLastPartitionDate(final String lastTableName) {
        final String[] tableNameParts = lastTableName.split("_");
        final String lastPartitionDateString = tableNameParts[tableNameParts.length - 1];
        return LocalDate.parse(lastPartitionDateString, PARTITION_PART_FORMATTER);
    }
}