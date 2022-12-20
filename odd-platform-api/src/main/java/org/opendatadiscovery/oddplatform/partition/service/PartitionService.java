package org.opendatadiscovery.oddplatform.partition.service;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PartitionService {
    Optional<String> getLastPartitionTableName(final Connection connection,
                                               final String tableName,
                                               final List<String> tableNameExclusions) throws SQLException;

    String createPartition(final Connection connection,
                           final String tableName,
                           final LocalDate beginDate,
                           final LocalDate endDate) throws SQLException;

    LocalDate getLastPartitionDate(final String tableName);

    List<String> getEmptyPastPartitions(final Connection connection,
                                        final String tableName,
                                        final List<String> tableNameExclusions) throws SQLException;

    void dropPartition(final Connection connection, final String partitionName) throws SQLException;
}
