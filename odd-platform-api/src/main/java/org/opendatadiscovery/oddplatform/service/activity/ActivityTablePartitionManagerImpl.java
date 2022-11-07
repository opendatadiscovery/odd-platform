package org.opendatadiscovery.oddplatform.service.activity;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import static java.time.format.DateTimeFormatter.ISO_LOCAL_DATE;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityTablePartitionManagerImpl implements ActivityTablePartitionManager {
    private static final DateTimeFormatter PARTITION_PART_FORMATTER = DateTimeFormatter.BASIC_ISO_DATE;

    @Value("${odd.activity.partition-period:30}")
    private Integer partitionDaysPeriod;

    @Override
    public void createPartitionsIfNotExists(final Connection connection) {
        try {
            final Optional<String> partitionName = getLastPartitionTableName(connection);
            LocalDate lastPartitionDate;
            if (partitionName.isPresent()) {
                lastPartitionDate = getLastPartitionDate(partitionName.get());
            } else {
                lastPartitionDate = LocalDate.now();
            }
            final LocalDate bufferDate = LocalDate.now().plusDays(partitionDaysPeriod);

            final List<ActivityTablePartition> newPartitions = new ArrayList<>();
            while (lastPartitionDate.isBefore(bufferDate)) {
                newPartitions.add(
                    new ActivityTablePartition(lastPartitionDate, lastPartitionDate.plusDays(partitionDaysPeriod * 2L))
                );
                lastPartitionDate = lastPartitionDate.plusDays(partitionDaysPeriod);
            }
            for (final ActivityTablePartition newPartition : newPartitions) {
                createPartitionTable(connection, newPartition.beginDate(), newPartition.endDate());
                log.debug("Created partition for date range: {} - {}", newPartition.beginDate(),
                    newPartition.endDate());
            }
        } catch (final Exception e) {
            throw new RuntimeException(e);
        }
    }

    private Optional<String> getLastPartitionTableName(final Connection connection) throws SQLException {
        final String sql = """
               SELECT table_name FROM information_schema.tables
               WHERE table_schema = ? AND table_name LIKE ?
               ORDER BY table_name DESC LIMIT 1
            """;
        try (final PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, "public");
            statement.setString(2, "activity_%");
            try (final ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return Optional.of(resultSet.getString("table_name"));
                }
                return Optional.empty();
            }
        }
    }

    private void createPartitionTable(final Connection connection,
                                      final LocalDate beginDate,
                                      final LocalDate endDate) throws SQLException {
        final String tableName = getTableName(beginDate, endDate);
        final String sql = "CREATE TABLE IF NOT EXISTS %s PARTITION OF activity FOR VALUES FROM ('%s') TO ('%s');"
            .formatted(tableName, beginDate.format(ISO_LOCAL_DATE), endDate.format(ISO_LOCAL_DATE));
        try (final PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.execute();
        }
    }

    private String getTableName(final LocalDate beginDate, final LocalDate endDate) {
        return "activity_" + PARTITION_PART_FORMATTER.format(beginDate)
            + "_" + PARTITION_PART_FORMATTER.format(endDate);
    }

    private LocalDate getLastPartitionDate(final String lastTableName) {
        final String[] tableNameParts = lastTableName.split("_");
        final String lastPartitionDateString = tableNameParts[tableNameParts.length - 1];
        return LocalDate.parse(lastPartitionDateString, PARTITION_PART_FORMATTER);
    }

    private record ActivityTablePartition(LocalDate beginDate, LocalDate endDate) {
    }
}
