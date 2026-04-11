package org.opendatadiscovery.oddplatform.partition.manager;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

import static java.util.Collections.emptyList;

public interface PartitionManager {
    void createPartitionsIfNotExists(final Connection connection);

    String getTableName();

    int getPartitionDaysPeriod();

    default List<String> getTableNameExclusions() {
        return emptyList();
    }

    default void runAdditionalQueriesForPartition(
        final Connection connection,
        final String partitionName
    ) throws SQLException {
    }
}
